import assert from 'node:assert/strict';
import test from 'node:test';
import { map_location_url, read_map_selection } from '../lib/map_location.ts';

import { atlas_location } from '../lib/new_york_atlas.ts';

test('server search parameters use the same map selection rules as browser URLs', () => {
  const cases = [
    [
      atlas_location,
      {
        medium: ['music', 'film'],
        q: 'billy joel',
        entry: 'music:new-york-state-of-mind:riverside',
      },
    ],
    [
      atlas_location,
      { medium: 'unknown', q: 'no-such-work-xyz', entry: 'invalid' },
    ],
  ];
  for (const [codec, params] of cases) {
    const url = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      for (const item of Array.isArray(value) ? value : [value])
        url.append(key, item);
    }
    assert.deepEqual(
      read_map_selection(codec, { ...params, unused: undefined, empty: [] }),
      codec.read(url),
    );
  }
});

test('map links preserve unrelated parameters and anchors while replacing owned values', () => {
  const url = map_location_url(
    'https://example.com/map?utm_source=friend&place=old&place=duplicate#reader',
    ['place', 'q'],
    { place: 'cafe-lalo', q: 'Café & books' },
  );
  assert.equal(url.searchParams.get('utm_source'), 'friend');
  assert.deepEqual(url.searchParams.getAll('place'), ['cafe-lalo']);
  assert.equal(url.searchParams.get('q'), 'Café & books');
  assert.equal(url.hash, '#reader');
  assert.equal(
    map_location_url(url.href, ['place', 'q'], {}).search,
    '?utm_source=friend',
  );
});
