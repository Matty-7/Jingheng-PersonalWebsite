import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { decode_pair_code } from './helpers/plus_code.mjs';

const catalog = JSON.parse(
  readFileSync(new URL('../content/nyc_music_map.json', import.meta.url)),
);

test('music places have traceable relations and bounded excerpts', () => {
  const place_ids = new Set(catalog.places.map((place) => place.id));
  assert.equal(place_ids.size, catalog.places.length);
  assert.equal(
    new Set(catalog.tracks.map((track) => track.id)).size,
    catalog.tracks.length,
  );
  assert.equal(
    new Set(catalog.tracks.map((track) => track.track_id)).size,
    catalog.tracks.length,
  );
  const used_places = new Set();
  for (const track of catalog.tracks) {
    assert.ok(track.place_ids.length > 0);
    assert.equal(new Set(track.place_ids).size, track.place_ids.length);
    for (const id of track.place_ids) {
      assert.ok(place_ids.has(id), `${track.id}: unknown place ${id}`);
      used_places.add(id);
    }
    assert.ok(
      track.excerpt.split(/\s+/).filter((word) => /\w/.test(word)).length <= 10,
      `${track.id}: excerpt too long`,
    );
    assert.ok(track.source_url.startsWith('https://'));
    assert.ok(track.source_label);
    assert.match(
      track.preview_url,
      /^https:\/\/audio-ssl\.itunes\.apple\.com\//,
    );
    assert.match(track.artwork_url, /^https:\/\/is\d-ssl\.mzstatic\.com\//);
    assert.equal(
      new URL(track.apple_music_url).searchParams.get('i'),
      String(track.track_id),
    );
    assert.ok(new URL(track.metadata_source).hostname === 'itunes.apple.com');
    if (track.relation.includes('lyrics') || track.relation === 'Lyrics')
      assert.ok(track.excerpt);
  }
  for (const place of catalog.places) {
    assert.ok(place.note.length > 30);
    assert.ok(used_places.has(place.id), `${place.id}: unused place`);
    assert.ok(
      [
        'Venue',
        'Landmark',
        'Intersection',
        'Representative point',
        'Neighborhood',
        'Borough',
        'Area',
        'City',
      ].includes(place.precision),
    );
    assert.match(place.map_query, /New York/);
    assert.equal(place.coordinates.length, 2);
    assert.ok(place.coordinates.every(Number.isFinite));
    assert.ok(place.coordinates[0] > 40.45 && place.coordinates[0] < 40.95);
    assert.ok(place.coordinates[1] > -74.3 && place.coordinates[1] < -73.7);
    assert.equal(
      new URL(place.coordinate_reference).hostname,
      'www.openstreetmap.org',
    );
  }
});

test('NYC music catalog does not change the ten featured homepage records', () => {
  const homepage_records = JSON.parse(
    readFileSync(new URL('../content/music.json', import.meta.url)),
  );
  assert.equal(homepage_records.length, 10);
  assert.deepEqual(
    catalog.tracks.find((track) => track.id === 'new-york-state-of-mind')
      .place_ids,
    ['chinatown', 'riverside'],
  );
});

test('all music markers use full Plus Codes containing their NYC coordinates', () => {
  for (const place of catalog.places) {
    const [south, west, north, east] = decode_pair_code(place.plus_code);
    const [latitude, longitude] = place.coordinates;
    assert.ok(
      latitude >= south &&
        latitude < north &&
        longitude >= west &&
        longitude < east,
      place.id,
    );
  }
});

test('artist connections have their own source and never invent a lyric location', () => {
  const review = JSON.parse(
    readFileSync(
      new URL('../docs/music_geography_review.json', import.meta.url),
    ),
  );
  assert.equal(review.city_tracks.length, 15);
  assert.equal(
    new Set(review.city_tracks.map((entry) => entry.track_id)).size,
    15,
  );
  for (const entry of review.city_tracks) {
    const track = catalog.tracks.find((item) => item.id === entry.track_id);
    assert.deepEqual(entry.place_ids, track.place_ids);
    if (entry.decision === 'artist_connection')
      assert.ok(track.connections?.length);
    if (entry.decision === 'song_lyrics') assert.ok(track.excerpt);
  }
  for (const track of catalog.tracks) {
    for (const connection of track.connections ?? []) {
      assert.ok(track.place_ids.includes(connection.place_id));
      assert.ok(connection.kind && connection.note && connection.source_label);
      assert.equal(new URL(connection.source_url).protocol, 'https:');
      assert.notEqual(
        new URL(connection.source_url).hostname,
        'music.apple.com',
      );
      assert.notEqual(connection.source_url, track.source_url);
    }
  }
  assert.deepEqual(
    catalog.tracks.find((track) => track.id === 'only-living-boy-in-new-york')
      .place_ids,
    ['forest-hills'],
  );
  assert.deepEqual(
    catalog.tracks.find((track) => track.id === 'new-york-city-serenade')
      .place_ids,
    ['broadway'],
  );
});
