import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { get_published_posts } from '../lib/post_visibility.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const links = JSON.parse(read('content/newsletter_links.json'));
const visible = () => get_published_posts(links, Date.parse('2026-09-09T12:00:00Z'));
function load_module(path, imports) {
  const exports = {};
  const compiled = ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports, Response,
    require: (id) => {
      assert.ok(id in imports, `Unexpected runtime import: ${id}`);
      return imports[id];
    },
  });
  return exports;
}

test('public newsletter data is first-article link only; prose has no runtime import', () => {
  assert.deepEqual(visible().map((post) => post.slug), ['something-of-my-own']);
  assert.equal(links[0].external_url, 'https://jinghenghuan.substack.com/p/something-of-my-own');
  assert.ok(links.every((post) => !('blocks' in post) && !('excerpt' in post)));
  for (const dir of ['app', 'lib', 'components']) {
    for (const path of readdirSync(new URL(`../${dir}`, import.meta.url), { recursive: true })) {
      if (/\.[cm]?[jt]sx?$/.test(path)) {
        assert.ok(!read(`${dir}/${path}`).includes('content/posts'), `${dir}/${path} imports archived prose`);
      }
    }
  }
});

test('old first route redirects, withdrawn and missing routes return notFound', async () => {
  const route = load_module('app/journal/[slug]/page.tsx', {
    '@/lib/publishing': { get_visible_posts: visible },
    'next/navigation': {
      permanentRedirect: (url) => { throw Object.assign(new Error('redirect'), { status: 308, url }); },
      notFound: () => { throw Object.assign(new Error('notFound'), { status: 404 }); },
    },
  });
  await assert.rejects(route.default({ params: Promise.resolve({ slug: links[0].slug }) }),
    (error) => error.status === 308 && error.url === links[0].external_url);
  for (const slug of ['across-the-water', 'unknown']) {
    await assert.rejects(route.default({ params: Promise.resolve({ slug }) }), (error) => error.status === 404);
  }
  assert.equal(route.metadata.robots.index, false);
});

test('RSS carries one external link with no prose; sitemap lists only internal landing pages', async () => {
  const feed = load_module('app/feed.xml/route.ts', {
    '@/lib/publishing': { get_visible_posts: visible },
    '@/content/profile.json': { default: { siteUrl: 'https://www.jinghenghuan.com' } },
  });
  const body = await feed.GET().text();
  assert.equal([...body.matchAll(/<item>/g)].length, 1);
  assert.ok(body.includes(`<link>${links[0].external_url}</link>`));
  assert.ok(!body.includes('Across the Water'));
  assert.ok(!body.match(/<item>.*<description>/));
  const sitemap = load_module('app/sitemap.ts', {
    '@/lib/seo': { absoluteUrl: (path) => `https://www.jinghenghuan.com${path}` },
  });
  assert.equal(JSON.stringify(sitemap.default().map((entry) => entry.url)),
    JSON.stringify(['https://www.jinghenghuan.com/', 'https://www.jinghenghuan.com/journal']));
});
