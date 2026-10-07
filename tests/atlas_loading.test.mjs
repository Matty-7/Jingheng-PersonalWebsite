import assert from 'node:assert/strict';
import test from 'node:test';
import { atlas_index_label, search_atlas_index } from '../lib/atlas_browser.ts';
import { normalize_search_text } from '../lib/search_text.ts';
import {
  atlas_entries,
  atlas_index,
  atlas_areas,
  atlas_year,
  atlas_detail,
  atlas_connections,
  atlas_maps_url,
  atlas_entry_label,
} from '../lib/new_york_atlas.ts';

test('lightweight search preserves every catalog field and ordered result', () => {
  const reference = atlas_entries.map((entry) => ({
    entry,
    text: normalize_search_text(
      [
        entry.title,
        entry.creator,
        atlas_year(entry),
        entry.place_name,
        entry.area,
        entry.relationship,
        atlas_areas.find((area) => area.places.includes(entry.place_key))?.name,
        entry.medium === 'film' ? entry.location.address : '',
      ].join(' '),
    ),
  }));
  const queries = new Set([
    '',
    'cafe lalo',
    'MARTA KAUFFMAN',
    '1994–2004',
    'henry   james',
    'billy joel riverside',
    'zzzz-no-match',
    ...atlas_entries.flatMap((entry) => [
      entry.title,
      entry.creator,
      entry.place_name,
      String(atlas_year(entry)),
      entry.area,
      entry.relationship,
      entry.medium === 'film' ? entry.location.address : '',
    ]),
    ...atlas_areas.map((area) => area.name),
  ]);
  for (const medium of ['all', 'film', 'literature', 'music']) {
    for (const query of queries) {
      const terms = normalize_search_text(query)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const expected = reference.filter(
        ({ entry, text }) =>
          (medium === 'all' || entry.medium === medium) &&
          terms.every((term) => text.includes(term)),
      );
      assert.deepEqual(
        search_atlas_index(atlas_index, medium, query).map((entry) => entry.id),
        expected.map(({ entry }) => entry.id),
        `${medium}: ${query}`,
      );
    }
  }
  assert.equal(atlas_index.length, atlas_entries.length);
  for (const [position, entry] of atlas_index.entries()) {
    assert.equal(
      atlas_index_label(entry),
      atlas_entry_label(atlas_entries[position]),
    );
    const compact = normalize_search_text(
      [entry.title, entry.place_name, entry.area, entry.search_text].join(' '),
    );
    for (const token of reference[position].text.split(/\s+/).filter(Boolean)) {
      assert.ok(
        compact.includes(token),
        `${entry.id}: retained search token ${token}`,
      );
    }
  }
  assert.ok(
    Buffer.byteLength(JSON.stringify(atlas_index)) < 160_000,
    'Initial search payload budget',
  );
  const passage = atlas_entries.find(
    (entry) => entry.medium === 'literature',
  ).passage;
  assert.equal(
    JSON.stringify(atlas_index).includes(passage.excerpt),
    false,
    'Passages stay out of the search index',
  );
});

test('on-demand details retain every original entry, source and geographic relationship', () => {
  for (const entry of atlas_entries) {
    const detail = atlas_detail(entry.id);
    assert.deepEqual(detail.entry, entry);
    assert.equal(detail.maps_url, atlas_maps_url(entry));
    assert.deepEqual(
      detail.related.entries.map((item) => item.id),
      atlas_connections(entry).entries.map((item) => item.id),
    );
    if (entry.medium === 'film')
      assert.deepEqual(
        detail.sources.map((source) => source.id),
        entry.scene.source_ids,
      );
    else assert.deepEqual(detail.sources, []);
  }
  for (const id of [
    null,
    '',
    'missing',
    '__proto__',
    '../../content/posts.json',
  ]) {
    assert.equal(atlas_detail(id), null);
  }
});
