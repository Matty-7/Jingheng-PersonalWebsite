import assert from 'node:assert/strict';
import test from 'node:test';
import { atlas_legacy_url } from '../lib/atlas_legacy.ts';
import {
  atlas_entries,
  atlas_index,
  atlas_location,
} from '../lib/new_york_atlas.ts';

test('every legacy selection redirects to its original Atlas record', () => {
  for (const entry of atlas_entries) {
    const old = new URL(entry.collection_url, 'https://example.com');
    const destination = new URL(
      atlas_legacy_url(entry.medium, Object.fromEntries(old.searchParams)),
      old,
    );
    assert.equal(destination.pathname, '/portfolio/new-york-atlas');
    assert.equal(destination.searchParams.get('entry'), entry.id);
    assert.equal(
      atlas_location.read(destination.searchParams).entry_id,
      entry.id,
    );
  }
  const invalid = new URL(
    atlas_legacy_url('film', {
      film: 'missing',
      place: 'missing',
      utm_source: 'test',
    }),
    'https://example.com',
  );
  assert.equal(invalid.searchParams.has('entry'), false);
  assert.equal(invalid.searchParams.get('utm_source'), 'test');
  const empty = atlas_location.initial_state;
  assert.equal(empty.entry_id, null);
  assert.deepEqual(
    atlas_location.read(new URLSearchParams(atlas_location.write(empty))),
    empty,
  );
});

test('every map marker preserves exact catalog coordinates and source-place identity', () => {
  for (const entry of atlas_entries) {
    const marker = atlas_index.find((record) => record.id === entry.id);
    const location =
      entry.medium === 'film'
        ? entry.location
        : entry.medium === 'literature'
          ? entry.passage
          : entry.place;
    assert.deepEqual(marker.coordinates, location.coordinates);
    assert.equal(marker.place_key, entry.place_key);
    assert.ok(marker.coordinates.every(Number.isFinite));
  }
});
