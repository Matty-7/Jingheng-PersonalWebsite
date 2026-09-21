import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { playlist_csv, playlist_text } from '../lib/music_playlist.ts';

const catalog = JSON.parse(readFileSync(new URL('../content/nyc_music_map.json', import.meta.url)));

test('playlist export retains every catalog recording and exact Apple link', () => {
  const csv = playlist_csv(catalog.tracks, catalog.places);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.equal(csv.trim().split('\r\n').length, catalog.tracks.length + 1);
  for (const track of catalog.tracks) assert.ok(csv.includes(track.apple_music_url));
  assert.equal(playlist_text(catalog.tracks).split('\n').length, catalog.tracks.length);
});

test('CSV protects Unicode, quotes, commas, newlines and spreadsheet formula prefixes', () => {
  const track = { ...catalog.tracks[0], title: 'New York, "你好"\nAgain', artist: '=1+1' };
  const csv = playlist_csv([track], catalog.places);
  assert.ok(csv.includes('"New York, ""你好""\nAgain"'));
  assert.ok(csv.includes('"\'=1+1"'));
});
