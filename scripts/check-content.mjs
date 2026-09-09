import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const read = async (name) =>
  JSON.parse(
    await readFile(new URL(`../content/${name}.json`, import.meta.url), 'utf8'),
  );
const [music, films, books, profile, posts, channels, projects, playbills] =
  await Promise.all(
    [
      'music',
      'films',
      'books',
      'profile',
      'posts',
      'channels',
      'projects',
      'playbills',
    ].map(read),
  );
const asset = async (path) => {
  assert.match(path, /^\/images\//);
  await access(new URL(`../public${path}`, import.meta.url));
};
const https = (url) => assert.equal(new URL(url).protocol, 'https:');
for (const [name, items] of Object.entries({ music, films, books }))
  assert.equal(items.length, 10, `${name} must contain exactly ten items`);
for (const song of music) {
  assert.equal(new URL(song.appleMusicUrl).hostname, 'music.apple.com');
  assert.match(new URL(song.previewUrl).hostname, /(^|\.)itunes\.apple\.com$/);
  assert.ok(song.trackId);
  await asset(song.artwork);
}
for (const film of films) {
  assert.ok(film.title && film.year && film.director);
  await asset(film.poster);
}
for (const book of books) {
  assert.ok(book.title && book.author && book.edition);
  assert.ok(book.coverWidth > 0 && book.coverHeight > 0);
  https(book.sourceUrl);
  await asset(book.cover);
}
assert.deepEqual(
  playbills.map((show) => show.slug),
  ['two-strangers', 'six', 'chicago', 'book-of-mormon', 'mamma-mia'],
);
for (const show of playbills) {
  assert.ok(show.title && show.label);
  assert.ok(show.coverWidth > 0 && show.coverHeight > show.coverWidth);
  assert.equal(new URL(show.sourceUrl).hostname, 'playbill.com');
  https(show.sourceUrl);
  https(show.artworkSourceUrl);
  await asset(show.cover);
}
assert.equal(new Set(music.map((x) => x.trackId)).size, 10);
assert.equal(new Set(films.map((x) => x.slug)).size, 10);
assert.equal(new Set(books.map((x) => x.slug)).size, 10);
assert.ok(
  films.some(
    (x) =>
      x.slug === 'memento' &&
      x.year === 2000 &&
      x.director === 'Christopher Nolan',
  ),
);
assert.ok(!films.some((x) => x.slug === 'rear-window'));
assert.equal(profile.name, 'Jingheng Huan');
Object.values(profile.links).forEach(https);
if (profile.newsletterUrl) https(profile.newsletterUrl);
await asset(channels.podcast.artwork);
await asset('/images/books/shelf-background.jpg');
for (const episode of channels.podcast.episodes) {
  https(episode.url);
  assert.ok(
    episode.title && episode.id && !Number.isNaN(Date.parse(episode.date)),
  );
}
const postSlugs = new Set();
for (const post of posts) {
  assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(!postSlugs.has(post.slug));
  postSlugs.add(post.slug);
  assert.ok(post.title && post.excerpt);
  assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(post.date).toISOString().slice(0, 10), post.date);
  assert.ok(['draft', 'published'].includes(post.status));
  assert.ok(['Essay', 'Note', 'Letter'].includes(post.kind));
  assert.ok(
    post.blocks.length > 0 &&
      post.blocks.every(
        (block) =>
          ['paragraph', 'heading'].includes(block.type) &&
          typeof block.text === 'string' &&
          block.text.trim(),
      ),
  );
}
for (const project of projects) {
  assert.ok(project.slug && project.title && project.description);
  https(project.url);
}
const newsletter_links = await read('newsletter_links');
for (const entry of newsletter_links) {
  assert.ok(entry.slug && entry.title && entry.date);
  assert.ok(['draft', 'published'].includes(entry.status));
  https(entry.external_url);
  assert.equal(new URL(entry.external_url).origin, new URL(profile.newsletterUrl).origin);
  assert.ok(!('blocks' in entry) && !('excerpt' in entry), 'Public newsletter links must not include prose');
}
const home = await readFile(
  new URL('../app/page.tsx', import.meta.url),
  'utf8',
);
assert.ok(
  !home.includes('lib/publishing') && !home.includes('content/posts'),
  'Draft content must not enter the homepage client bundle',
);
console.log(
  'Verified: 10 songs, 10 films, 10 cover books, 5 Playbills; assets, channel links, project and publication data.',
);
