import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const read = async(name)=>JSON.parse(await readFile(new URL(`../content/${name}.json`,import.meta.url),'utf8'));
const [music,films,books]=await Promise.all(['music','films','books'].map(read));
for(const [name,items] of Object.entries({music,films,books}))assert.equal(items.length,10,`${name} must contain exactly ten items`);
for(const song of music){assert.equal(new URL(song.appleMusicUrl).hostname,'music.apple.com');assert.match(new URL(song.previewUrl).hostname,/(^|\.)itunes\.apple\.com$/);assert.ok(song.trackId);await access(new URL(`../public${song.artwork}`,import.meta.url))}
for(const film of films){assert.ok(film.title&&film.year&&film.director);assert.ok(film.poster,'Every film needs its actual poster');await access(new URL(`../public${film.poster}`,import.meta.url))}
for(const book of books)assert.ok(book.title&&book.author);
assert.equal(new Set(music.map(x=>x.trackId)).size,10);
assert.equal(new Set(films.map(x=>x.slug)).size,10);
console.log('Content verified: ten songs, ten films, ten books; all display assets exist.');
