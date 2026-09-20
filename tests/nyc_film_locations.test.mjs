import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const data = JSON.parse(readFileSync(new URL('../content/nyc_film_locations.json', import.meta.url), 'utf8'));

test('film locations have unique places, valid NYC coordinates and traceable film relationships', () => {
  const film_ids = new Set(data.films.map((film) => film.id));
  const source_ids = new Set(data.sources.map((source) => source.id));
  assert.equal(film_ids.size, data.films.length);
  assert.equal(new Set(data.locations.map((place) => place.id)).size, data.locations.length);
  for (const film of data.films) assert.ok(data.locations.some((place) => place.scenes.some((scene) => scene.film_id === film.id)), film.id);
  for (const source of data.sources) assert.equal(new URL(source.url).protocol, 'https:');
  for (const place of data.locations) {
    const [latitude, longitude] = place.coordinates;
    assert.ok(latitude > 40.49 && latitude < 40.93 && longitude > -74.26 && longitude < -73.68, place.id);
    assert.ok(place.address && place.access && place.visit_note, place.id);
    assert.ok(place.scenes.length, place.id);
    assert.equal(new Set(place.scenes.map((scene) => scene.film_id)).size, place.scenes.length);
    for (const scene of place.scenes) {
      assert.ok(film_ids.has(scene.film_id), place.id);
      assert.ok(scene.scene && scene.source_ids.length, place.id);
      for (const id of scene.source_ids) assert.ok(source_ids.has(id), `${place.id}: ${id}`);
    }
  }
  assert.ok(film_ids.has('youve-got-mail') && film_ids.has('anora'));
});
