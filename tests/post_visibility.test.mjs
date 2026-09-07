import assert from 'node:assert/strict';
import { test } from 'node:test';
import { get_published_posts } from '../lib/post_visibility.ts';

test('public entries exclude drafts, future dates, and invalid dates', () => {
  const posts = [
    { slug: 'draft', status: 'draft', date: '2026-09-01' },
    { slug: 'future', status: 'published', date: '2026-09-08' },
    { slug: 'invalid', status: 'published', date: 'invalid' },
    { slug: 'older', status: 'published', date: '2026-09-05' },
    { slug: 'today', status: 'published', date: '2026-09-07' },
  ];
  const before = structuredClone(posts);
  const visible = get_published_posts(posts, Date.parse('2026-09-07T12:00:00Z'));
  assert.deepEqual(visible.map((post) => post.slug), ['today', 'older']);
  assert.deepEqual(posts, before);
});

test('publication opens at midnight UTC on the specified day', () => {
  const posts = [{ status: 'published', date: '2026-09-08' }];
  assert.equal(get_published_posts(posts, Date.parse('2026-09-07T23:59:59Z')).length, 0);
  assert.equal(get_published_posts(posts, Date.parse('2026-09-08T00:00:00Z')).length, 1);
});
