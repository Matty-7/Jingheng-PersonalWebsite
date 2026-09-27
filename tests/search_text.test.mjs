import assert from 'node:assert/strict';
import test from 'node:test';
import { search_atlas_index } from '../lib/atlas_browser.ts';
import { atlas_index } from '../lib/new_york_atlas.ts';

test('Atlas film search handles accents, case and smart apostrophes', () => {
  for (const query of ['cafe lalo', 'café lalo', 'CAFÉ LALO']) {
    assert.ok(
      search_atlas_index(atlas_index, 'film', query).some(
        (entry) => entry.place_key === 'film:cafe-lalo',
      ),
    );
  }
  const straight = search_atlas_index(atlas_index, 'film', "you've got mail");
  assert.ok(straight.length > 0);
  assert.deepEqual(
    search_atlas_index(atlas_index, 'film', 'you’ve got mail'),
    straight,
  );
  assert.deepEqual(
    search_atlas_index(atlas_index, 'film', 'cafe lalo nonexistentword'),
    [],
  );
});

test('Atlas literary and music queries share accent and case handling with AND semantics', () => {
  for (const medium of ['literature', 'music']) {
    const matches = search_atlas_index(atlas_index, medium, 'new york');
    assert.ok(matches.length > 0);
    assert.deepEqual(
      search_atlas_index(atlas_index, medium, 'NÉW YÓRK'),
      matches,
    );
    assert.deepEqual(
      search_atlas_index(atlas_index, medium, 'new york nonexistentword'),
      [],
    );
  }
});
