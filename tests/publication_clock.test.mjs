import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { get_published_posts } from '../lib/post_visibility.ts';

test('publication visibility follows request time after a zero-clock Worker startup', () => {
  const posts = JSON.parse(readFileSync(new URL('../content/newsletter_links.json', import.meta.url), 'utf8'));
  const fixtures = [
    ...posts,
    { slug: 'private-draft', status: 'draft', date: '2026-09-01' },
    { slug: 'scheduled', status: 'published', date: '2026-09-10' },
  ];
  let now = 0;
  const exports = {};
  const source = readFileSync(new URL('../lib/publishing.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require: (id) => {
      if (id === '@/content/newsletter_links.json') return { default: fixtures };
      if (id === '@/content/profile.json') return { default: { newsletterUrl: null } };
      if (id === '@/lib/post_visibility') {
        return { get_published_posts: (items) => get_published_posts(items, now) };
      }
      throw new Error(`Unexpected import: ${id}`);
    },
  });
  assert.equal(exports.get_visible_posts().length, 0);
  now = Date.parse('2026-09-09T12:00:00Z');
  assert.deepEqual(exports.get_visible_posts().map((post) => post.slug), posts.filter((post) => post.status === 'published').map((post) => post.slug));
  now = Date.parse('2026-09-10T00:00:00Z');
  assert.equal(exports.get_visible_posts()[0].slug, 'scheduled');
  assert.ok(!exports.get_visible_posts().some((post) => post.slug === 'private-draft'));
});
