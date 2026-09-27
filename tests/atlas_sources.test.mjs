import assert from 'node:assert/strict';
import test from 'node:test';
import { atlas_entries, atlas_detail } from '../lib/new_york_atlas.ts';
import {
  atlas_music_platform_urls,
  atlas_story_sources,
  source_url_key,
} from '../lib/atlas_sources.ts';

test('every Atlas entry retains each distinct source exactly once', () => {
  for (const entry of atlas_entries) {
    const detail = atlas_detail(entry.id, '');
    const platform_urls =
      entry.medium === 'music'
        ? Object.values(atlas_music_platform_urls(entry.track))
        : [];
    const actual = [
      ...atlas_story_sources(detail).map((source) => source.url),
      ...platform_urls,
    ].map(source_url_key);
    const expected =
      entry.medium === 'film'
        ? [
            entry.scene.still?.source_url,
            ...detail.sources.map((source) => source.url),
          ]
        : entry.medium === 'literature'
          ? [
              entry.work.cover?.source_url,
              entry.passage.source_url,
              entry.passage.place_source_url,
            ]
          : [
              detail.connection?.source_url,
              entry.track.source_url,
              ...platform_urls,
            ];
    assert.equal(actual.length, new Set(actual).size, entry.id);
    assert.deepEqual(
      new Set(actual),
      new Set(expected.filter(Boolean).map(source_url_key)),
      entry.id,
    );
    if (entry.medium === 'film' && entry.scene.still)
      assert.equal(atlas_story_sources(detail)[0].kind, 'image', entry.id);
  }
});

test('source equivalence ignores document fragments and tracking but keeps distinct content', () => {
  assert.equal(
    source_url_key('https://example.com/story/?utm_source=atlas#photo'),
    source_url_key('https://example.com/story'),
  );
  assert.equal(
    source_url_key('https://example.com/?b=2&a=1'),
    source_url_key('https://example.com/?a=1&b=2'),
  );
  assert.notEqual(
    source_url_key('https://music.apple.com/album/123?i=456'),
    source_url_key('https://music.apple.com/album/123?i=789'),
  );
});

test('literary cover sources take priority over repeated text and place links', () => {
  const detail = structuredClone(
    atlas_detail(
      atlas_entries.find(
        (entry) => entry.medium === 'literature' && entry.work.cover,
      ).id,
      '',
    ),
  );
  detail.entry.passage.source_url = `${detail.entry.work.cover.source_url}#text`;
  detail.entry.passage.place_source_url = detail.entry.work.cover.source_url;
  assert.deepEqual(
    atlas_story_sources(detail).map((source) => source.kind),
    ['cover'],
  );
});

test('music keeps platform icons and only distinct supporting sources', () => {
  const detail = structuredClone(
    atlas_detail(
      atlas_entries.find((entry) => entry.medium === 'music').id,
      '',
    ),
  );
  detail.entry.track.source_url = detail.entry.track.apple_music_url;
  detail.connection = {
    source_url: detail.entry.track.apple_music_url,
    source_label: 'Recording',
  };
  assert.deepEqual(atlas_story_sources(detail), []);
  detail.connection.source_url = 'https://example.com/recording';
  detail.entry.track.source_url = 'https://example.com/recording#lyrics';
  assert.deepEqual(
    atlas_story_sources(detail).map((source) => source.kind),
    ['connection'],
  );
});
