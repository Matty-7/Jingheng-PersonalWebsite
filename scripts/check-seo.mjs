import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const profile = JSON.parse(
  await readFile(new URL('../content/profile.json', import.meta.url), 'utf8'),
);
const posts = JSON.parse(
  await readFile(new URL('../content/newsletter_links.json', import.meta.url), 'utf8'),
);
const archived_posts = JSON.parse(
  await readFile(new URL('../content/posts.json', import.meta.url), 'utf8'),
);
const origin = process.argv[2];
assert.ok(origin, 'Pass the development server URL or the production URL.');
const canonical = profile.siteUrl;
const published = posts.filter(
  (post) =>
    post.status === 'published' &&
    Date.parse(`${post.date}T00:00:00Z`) <= Date.now(),
);
async function read(path, base = origin) {
  const response = await fetch(new URL(path, base), {
    redirect: 'manual',
    headers: { 'User-Agent': 'JinghengHuan-SiteCheck/1.0' },
    signal: AbortSignal.timeout(20000),
  });
  return { response, body: await response.text() };
}
const tagValue = (html, selector, attribute) => {
  const tag = html.match(new RegExp(`<[^>]+${selector}[^>]*>`))?.[0];
  return tag?.match(new RegExp(`${attribute}="([^"]*)"`))?.[1];
};
const structuredData = (html) =>
  [
    ...html.matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
    ),
  ].map((match) => JSON.parse(match[1]));

for (const path of [
  '/',
  '/journal',
]) {
  const { response, body } = await read(path);
  assert.equal(response.status, 200, path);
  assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'), path);
  assert.ok(
    !/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(body),
    path,
  );
  assert.match(body, /<title[^>]*>[^<]*Jingheng Huan[^<]*<\/title>/);
  const expected = new URL(path, canonical).href.replace(/\/$/, '');
  assert.equal(
    tagValue(body, 'rel="canonical"', 'href')?.replace(/\/$/, ''),
    expected,
  );
  assert.equal(
    tagValue(body, 'property="og:url"', 'content')?.replace(/\/$/, ''),
    expected,
  );
  assert.ok(tagValue(body, 'name="description"', 'content'), path);
  if (path === '/') {
    assert.match(body, /<title[^>]*>Jingheng Huan<\/title>/);
    assert.equal(tagValue(body, 'name="description"', 'content'), profile.description);
    const graph = structuredData(body).flatMap((data) => data['@graph'] ?? []);
    const person = graph.find((node) => node['@type'] === 'Person');
    assert.equal(person.name, profile.name);
    assert.deepEqual(person.alternateName, [profile.creatorName, profile.chineseName]);
    assert.ok(person.sameAs.includes(profile.links.linkedin));
    assert.ok(
      graph.some(
        (node) => node['@type'] === 'WebSite' && node.url === `${canonical}/`,
      ),
    );
    assert.ok(
      graph.some(
        (node) =>
          node['@type'] === 'ProfilePage' &&
          node.mainEntity['@id'] === person['@id'],
      ),
    );
    assert.ok(body.includes('also known as Matty Huan'));
  } else {
    for (const post of published) {
      assert.ok(body.includes(`href="${post.external_url}"`));
      assert.ok(body.includes(post.title));
    }
    assert.ok(!body.includes('href="/journal/'));
  }
  for (const post of archived_posts) {
    assert.ok(!body.includes(post.blocks[0].text), 'Archived prose must not be rendered');
    if (!published.some((entry) => entry.slug === post.slug)) {
      assert.ok(!body.includes(post.title), 'Withdrawn article must not be listed');
    }
  }
}
for (const post of published) {
  const { response, body } = await read(`/journal/${post.slug}`);
  assert.equal(response.status, 308, post.slug);
  assert.equal(response.headers.get('location'), post.external_url);
  assert.ok(!body.includes('BlogPosting'));
  for (const archived of archived_posts) assert.ok(!body.includes(archived.blocks[0].text));
}
const feed = await read('/feed.xml');
assert.equal(feed.response.status, 200);
assert.ok(feed.response.headers.get('content-type')?.includes('xml'));
assert.equal([...feed.body.matchAll(/<item>/g)].length, published.length);
for (const post of published) {
  assert.ok(feed.body.includes(`<link>${post.external_url}</link>`));
  assert.ok(feed.body.includes(`<guid isPermaLink="true">${post.external_url}</guid>`));
}
for (const archived of archived_posts) {
  assert.ok(!feed.body.includes(archived.blocks[0].text));
  if (!published.some((post) => post.slug === archived.slug)) assert.ok(!feed.body.includes(archived.title));
}
const robots = await read('/robots.txt');
assert.equal(robots.response.status, 200);
assert.match(robots.body, /User-Agent: \*/i);
assert.match(robots.body, /Allow: \//);
assert.ok(robots.body.includes(`Sitemap: ${canonical}/sitemap.xml`));
assert.ok(!robots.body.includes('Disallow: /'));
const sitemap = await read('/sitemap.xml');
assert.equal(sitemap.response.status, 200);
assert.ok(sitemap.response.headers.get('content-type')?.includes('xml'));
const urls = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => match[1])
  .sort((a, b) => a.localeCompare(b));
assert.deepEqual(
  urls,
  [
    `${canonical}/`,
    `${canonical}/journal`,
  ].sort((a, b) => a.localeCompare(b)),
);
for (const slug of [
  'seo-check-missing-page',
  ...archived_posts.filter((post) => !published.some((entry) => entry.slug === post.slug)).map((post) => post.slug),
  ...posts.filter((post) => !published.includes(post)).map((post) => post.slug),
]) {
  const missing = await read(`/journal/${slug}`);
  assert.equal(missing.response.status, 404);
  assert.ok(missing.body.includes('noindex'));
}
if (new URL(origin).hostname === new URL(canonical).hostname) {
  for (const alias of [
    'https://jinghenghuan.com',
    'https://jingheng-huan.jh730493450.chatgpt.site',
  ]) {
    const { response } = await read('/journal?source=seo-check', alias);
    assert.equal(response.status, 308, alias);
    assert.equal(
      response.headers.get('location'),
      `${canonical}/journal?source=seo-check`,
    );
  }
}
console.log(
  'SEO checks passed: crawlable pages, metadata, identity data, sitemap, robots and unpublished-page protection.',
);
