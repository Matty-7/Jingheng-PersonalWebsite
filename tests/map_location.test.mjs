import assert from 'node:assert/strict';
import test from 'node:test';
import { map_location_url } from '../lib/map_location.ts';
import { film_location } from '../lib/nyc_film_location.ts';
import { literary_location } from '../lib/nyc_literary_location.ts';
import { music_location } from '../lib/nyc_music_location.ts';

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

test('film links reject unknown films and places outside the selected film or search', () => {
  assert.deepEqual(
    film_location.read(
      new URLSearchParams('film=manhattan&place=sutton-square'),
    ),
    { film_id: 'manhattan', selected_id: 'sutton-square', query: '' },
  );
  assert.equal(
    film_location.read(new URLSearchParams('film=anora&place=sutton-square'))
      .selected_id,
    null,
  );
  assert.equal(
    film_location.read(new URLSearchParams('film=unknown')).film_id,
    'all',
  );
  assert.equal(
    film_location.read(
      new URLSearchParams('q=no-such-film&place=sutton-square'),
    ).selected_id,
    null,
  );
});

test('literary links restore passages and safely normalize conflicting works and empty searches', () => {
  const first = literary_location.initial_state;
  assert.deepEqual(literary_location.read(new URLSearchParams()), first);
  assert.equal(
    literary_location.read(new URLSearchParams('work=unknown&passage=missing'))
      .selected_id,
    first.selected_id,
  );
  const filtered = literary_location.read(
    new URLSearchParams('work=gatsby&passage=' + first.selected_id),
  );
  assert.equal(filtered.work_id, 'gatsby');
  assert.notEqual(filtered.selected_id, first.selected_id);
  assert.deepEqual(
    literary_location.read(
      new URLSearchParams(literary_location.write(filtered)),
    ),
    filtered,
  );
  assert.equal(
    literary_location.read(new URLSearchParams('q=zzzz-no-passage'))
      .selected_id,
    '',
  );
});

test('music links keep places within a recording and preserve overview during empty searches', () => {
  const restored = music_location.read(
    new URLSearchParams('track=new-york-state-of-mind&place=riverside'),
  );
  assert.equal(restored.place_id, 'riverside');
  const conflict = music_location.read(
    new URLSearchParams('track=cornelia-street&place=riverside'),
  );
  assert.equal(conflict.track_id, 'cornelia-street');
  assert.equal(conflict.place_id, 'cornelia-street');
  assert.equal(
    music_location.read(new URLSearchParams('track=unknown&place=unknown'))
      .track_id,
    music_location.initial_state.track_id,
  );
  assert.equal(
    music_location.read(new URLSearchParams('q=zzzz-no-track')).track_id,
    null,
  );
  const overview = music_location.read(
    new URLSearchParams('track=cornelia-street&view=all&q=zzzz-no-track'),
  );
  assert.equal(overview.track_id, 'cornelia-street');
  assert.equal(overview.overview, true);
  assert.deepEqual(
    music_location.read(new URLSearchParams(music_location.write(overview))),
    overview,
  );
});
