import assert from 'node:assert/strict';
import test from 'node:test';
import { search_atlas } from '../lib/new_york_atlas.ts';
import { search_locations } from '../lib/nyc_film_map.ts';
import { search_literary_entries } from '../lib/nyc_literary_map.ts';
import { search_music } from '../lib/nyc_music_map.ts';

test('Atlas and Film find the same target with accents and smart apostrophes', () => {
  for (const query of ['cafe lalo', 'café lalo', 'CAFÉ LALO']) {
    assert.ok(
      search_locations('all', query).some((place) => place.id === 'cafe-lalo'),
    );
    assert.ok(
      search_atlas('film', query).some(
        (entry) => entry.location.id === 'cafe-lalo',
      ),
    );
  }
  const straight = search_locations('all', "you've got mail").map(
    (place) => place.id,
  );
  assert.ok(straight.length > 0);
  assert.deepEqual(
    search_locations('all', 'you’ve got mail').map((place) => place.id),
    straight,
  );
  assert.ok(
    search_atlas('film', 'you’ve got mail').some(
      (entry) => entry.work.id === 'youve-got-mail',
    ),
  );
  assert.deepEqual(search_locations('anora', 'cafe lalo'), []);
  assert.deepEqual(search_locations('all', 'cafe lalo nonexistentword'), []);
});

test('literary and music queries share accent and case handling without changing AND semantics', () => {
  for (const search of [
    (query) => search_literary_entries('all', query),
    search_music,
  ]) {
    const matches = search('new york');
    assert.ok(matches.length > 0);
    assert.deepEqual(search('NÉW YÓRK'), matches);
    assert.deepEqual(search('new york nonexistentword'), []);
  }
});
