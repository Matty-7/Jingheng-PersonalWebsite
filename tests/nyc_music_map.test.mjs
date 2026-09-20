import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const catalog = JSON.parse(readFileSync(new URL('../content/nyc_music_map.json', import.meta.url)));

test('music places have traceable relations and bounded excerpts', () => {
  const place_ids = new Set(catalog.places.map((place) => place.id));
  assert.equal(place_ids.size, catalog.places.length);
  assert.equal(new Set(catalog.tracks.map((track) => track.id)).size, catalog.tracks.length);
  assert.equal(new Set(catalog.tracks.map((track) => track.track_id)).size, catalog.tracks.length);
  const used_places = new Set();
  for (const track of catalog.tracks) {
    assert.ok(track.place_ids.length > 0);
    assert.equal(new Set(track.place_ids).size, track.place_ids.length);
    for (const id of track.place_ids) {
      assert.ok(place_ids.has(id), `${track.id}: unknown place ${id}`);
      used_places.add(id);
    }
    assert.ok(track.excerpt.split(/\s+/).filter((word) => /\w/.test(word)).length <= 10, `${track.id}: excerpt too long`);
    assert.ok(track.source_url.startsWith('https://'));
    assert.ok(track.source_label);
    assert.match(track.preview_url, /^https:\/\/audio-ssl\.itunes\.apple\.com\//);
    assert.match(track.artwork_url, /^https:\/\/is\d-ssl\.mzstatic\.com\//);
    assert.equal(new URL(track.apple_music_url).searchParams.get('i'), String(track.track_id));
    assert.ok(new URL(track.metadata_source).hostname === 'itunes.apple.com');
    if (track.relation.includes('lyrics') || track.relation === 'Lyrics') assert.ok(track.excerpt);
  }
  for (const place of catalog.places) {
    assert.ok(place.note.length > 30);
    assert.ok(used_places.has(place.id), `${place.id}: unused place`);
    assert.ok(['Venue', 'Landmark', 'Intersection', 'Representative point', 'Neighborhood', 'Borough', 'Area'].includes(place.precision));
    assert.match(place.map_query, /New York/);
  }
});

test('NYC music catalog does not change the ten featured homepage records', () => {
  const homepage_records = JSON.parse(readFileSync(new URL('../content/music.json', import.meta.url)));
  assert.equal(homepage_records.length, 10);
  assert.deepEqual(catalog.tracks.find((track) => track.id === 'new-york-state-of-mind').place_ids, ['chinatown', 'riverside']);
});
