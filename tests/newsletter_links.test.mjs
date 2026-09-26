import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { get_published_posts } from '../lib/post_visibility.ts';
import { validate_newsletter_links } from '../lib/newsletter_schema.ts';

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const links = JSON.parse(read('content/newsletter_links.json'));
const fixtures = JSON.parse(read('tests/fixtures/newsletter_links.json'));
const visible = () =>
  get_published_posts(fixtures, Date.parse('2026-09-22T12:00:00Z'));
function load_module(path, imports) {
  const exports = {};
  const compiled = ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    Response,
    require: (id) => {
      assert.ok(id in imports, `Unexpected runtime import: ${id}`);
      return imports[id];
    },
  });
  return exports;
}

test('public newsletter metadata covers the verified archive without importing prose', () => {
  const profile = JSON.parse(read('content/profile.json'));
  assert.deepEqual(
    validate_newsletter_links(links, profile.newsletterUrl).errors,
    [],
  );
  assert.ok(
    links.every(
      (post) =>
        post.external_url ===
        `https://jinghenghuan.substack.com/p/${post.slug}`,
    ),
  );
  assert.ok(links.every((post) => !('blocks' in post) && !('excerpt' in post)));
  for (const dir of ['app', 'lib', 'components']) {
    for (const path of readdirSync(new URL(`../${dir}`, import.meta.url), {
      recursive: true,
    })) {
      if (/\.[cm]?[jt]sx?$/.test(path)) {
        assert.ok(
          !read(`${dir}/${path}`).includes('content/posts'),
          `${dir}/${path} imports archived prose`,
        );
      }
    }
  }
});

test('every published route redirects; draft, future and missing routes return notFound', async () => {
  const route = load_module('app/journal/[slug]/page.tsx', {
    '@/lib/publishing': {
      get_visible_posts: () =>
        get_published_posts(
          [
            ...fixtures,
            { ...fixtures[0], slug: 'draft-article', status: 'draft' },
            { ...fixtures[0], slug: 'future-article', date: '2099-01-01' },
            { ...fixtures[0], slug: 'invalid-date', date: '2026-02-30' },
          ],
          Date.parse('2026-09-22T12:00:00Z'),
        ),
    },
    'next/navigation': {
      permanentRedirect: (url) => {
        throw Object.assign(new Error('redirect'), { status: 308, url });
      },
      notFound: () => {
        throw Object.assign(new Error('notFound'), { status: 404 });
      },
    },
  });
  for (const post of fixtures) {
    await assert.rejects(
      route.default({ params: Promise.resolve({ slug: post.slug }) }),
      (error) => error.status === 308 && error.url === post.external_url,
    );
  }
  for (const slug of [
    'draft-article',
    'future-article',
    'invalid-date',
    'unknown',
  ]) {
    await assert.rejects(
      route.default({ params: Promise.resolve({ slug }) }),
      (error) => error.status === 404,
    );
  }
  assert.equal(route.metadata.robots.index, false);
});

test('RSS matches the published archive without prose; sitemap lists internal landing pages', async () => {
  const feed = load_module('app/feed.xml/route.ts', {
    '@/lib/publishing': { get_visible_posts: visible },
    '@/content/profile.json': {
      default: {
        siteUrl: 'https://www.jinghenghuan.com',
        newsletterUrl: 'https://jinghenghuan.substack.com',
      },
    },
  });
  const body = await feed.GET().text();
  assert.ok(body.includes('<link>https://jinghenghuan.substack.com</link>'));
  assert.equal([...body.matchAll(/<item>/g)].length, visible().length);
  for (const post of visible())
    assert.ok(body.includes(`<link>${post.external_url}</link>`));
  assert.ok(!body.match(/<item>.*<description>/));
  const sitemap = load_module('app/sitemap.ts', {
    '@/lib/seo': {
      absoluteUrl: (path) => `https://www.jinghenghuan.com${path}`,
    },
  });
  assert.equal(
    JSON.stringify(sitemap.default().map((entry) => entry.url)),
    JSON.stringify([
      'https://www.jinghenghuan.com/',
      'https://www.jinghenghuan.com/portfolio/mortgage-map',
      'https://www.jinghenghuan.com/portfolio/new-york-atlas',
      'https://www.jinghenghuan.com/portfolio/nyc-film-map',
      'https://www.jinghenghuan.com/portfolio/nyc-literary-map',
      'https://www.jinghenghuan.com/portfolio/nyc-music-map',
    ]),
  );
});
