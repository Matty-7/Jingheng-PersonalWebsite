import assert from 'node:assert/strict';
import test from 'node:test';
import {
  atlas_entries,
  atlas_counts,
  atlas_areas,
  atlas_connections,
  atlas_embed_url,
  atlas_maps_url,
  atlas_location,
  search_atlas,
} from '../lib/new_york_atlas.ts';
import { film_locations } from '../lib/nyc_film_map.ts';
import { literary_entries } from '../lib/nyc_literary_map.ts';
import { music_tracks } from '../lib/nyc_music_map.ts';

test('Atlas retains every original scene, passage and track-place relationship', () => {
  assert.deepEqual(atlas_counts, { film: 20, literature: 19, music: 118 });
  assert.equal(
    new Set(atlas_entries.map((entry) => entry.id)).size,
    atlas_entries.length,
  );
  assert.equal(
    search_atlas('film', '').length,
    film_locations.reduce((n, place) => n + place.scenes.length, 0),
  );
  assert.equal(search_atlas('literature', '').length, literary_entries.length);
  assert.equal(
    search_atlas('music', '').length,
    music_tracks.reduce((n, track) => n + track.place_ids.length, 0),
  );
  for (const entry of atlas_entries) {
    assert.ok(
      entry.title && entry.creator && entry.precision && entry.relationship,
    );
    const params = new URL(entry.collection_url, 'https://example.com')
      .searchParams;
    if (entry.medium === 'film') {
      assert.equal(params.get('film'), entry.scene.film_id);
      assert.equal(params.get('place'), entry.location.id);
    }
    if (entry.medium === 'literature') {
      assert.equal(params.get('passage'), entry.passage.id);
      assert.equal(params.get('work'), entry.work.id);
    }
    if (entry.medium === 'music') {
      assert.equal(params.get('track'), entry.track.id);
      assert.equal(params.get('place'), entry.place.id);
    }
  }
});

test('area connections keep distinct source places, pins and scope', () => {
  for (const area of atlas_areas)
    for (const key of area.places)
      assert.ok(
        atlas_entries.some((entry) => entry.place_key === key),
        key,
      );
  const literary = atlas_entries.find(
    (entry) => entry.id === 'literature:washington-square',
  );
  const related = atlas_connections(literary);
  assert.equal(related.label, 'Around Washington Square');
  const arch = related.entries.find(
    (entry) => entry.place_key === 'film:washington-square-arch',
  );
  assert.ok(arch);
  assert.notEqual(arch.place_key, literary.place_key);
  assert.match(literary.precision, /not an identified address/);
  assert.ok(related.entries.some((entry) => entry.medium === 'music'));
  assert.equal(
    related.entries.some((entry) => entry.id === literary.id),
    false,
  );
});

test('unified search covers creators, places, titles and accents within media', () => {
  assert.ok(
    search_atlas('all', 'washington square').some(
      (entry) => entry.medium === 'music',
    ),
  );
  assert.ok(
    search_atlas('all', 'henry james').every(
      (entry) => entry.medium === 'literature',
    ),
  );
  assert.ok(search_atlas('film', 'woody allen').length > 0);
  assert.ok(search_atlas('film', 'cafe lalo').length > 0);
  assert.ok(search_atlas('music', 'billy joel').length > 0);
  assert.equal(search_atlas('literature', 'billy joel').length, 0);
  assert.equal(search_atlas('all', 'zzzz-no-match').length, 0);
});

test('Atlas codec resolves incompatible or invalid selection and restores valid links', () => {
  const invalid = atlas_location.read(
    new URLSearchParams('medium=bogus&entry=missing'),
  );
  assert.equal(invalid.medium, 'all');
  assert.equal(invalid.entry_id, atlas_entries[0].id);
  const empty = atlas_location.read(new URLSearchParams('q=zzzz-no-match'));
  assert.equal(empty.entry_id, null);
  for (const entry of atlas_entries) {
    const state = atlas_location.read(
      new URLSearchParams({ medium: entry.medium, entry: entry.id }),
    );
    assert.equal(state.entry_id, entry.id);
    assert.deepEqual(
      atlas_location.read(new URLSearchParams(atlas_location.write(state))),
      state,
    );
  }
});

test('every Atlas map preserves the existing free endpoint and keyless fallback', () => {
  for (const entry of atlas_entries) {
    const url = new URL(atlas_embed_url(entry, 'test-only-key'));
    assert.equal(url.origin, 'https://www.google.com');
    assert.equal(url.pathname, '/maps/embed/v1/place');
    assert.equal(atlas_embed_url(entry, ''), null);
    const external = new URL(atlas_maps_url(entry));
    assert.equal(external.pathname, '/maps/search/');
    assert.equal(external.searchParams.has('key'), false);
    if (entry.medium !== 'film') {
      const coordinates =
        entry.medium === 'literature'
          ? entry.passage.coordinates
          : entry.place.coordinates;
      assert.equal(url.searchParams.get('center'), coordinates.join(','));
      assert.equal(external.searchParams.get('query'), coordinates.join(','));
    }
  }
});
