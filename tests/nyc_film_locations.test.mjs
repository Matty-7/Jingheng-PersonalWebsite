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

test('real scene frames have local derivatives and matching provenance; missing frames are explicit', () => {
  const provenance = JSON.parse(readFileSync(new URL('../content/nyc_film_frame_provenance.json', import.meta.url), 'utf8'));
  const missing = [];
  const originals = new Set();
  for (const place of data.locations) {
    for (const scene of place.scenes) {
      const record = provenance.records.find((entry) => entry.location_id === place.id && entry.film_id === scene.film_id);
      assert.ok(record, `${place.id}/${scene.film_id}`);
      if (!scene.still) { missing.push(place.id); continue; }
      const still = scene.still;
      assert.equal(record.frame_status, 'verified_frame');
      assert.equal(record.original_image, still.image_url);
      assert.equal(record.source_page, still.source_url);
      assert.ok(still.alt && still.credit && still.width > 0 && still.height > 0);
      assert.equal(new URL(still.source_url).protocol, 'https:');
      assert.equal(new URL(still.image_url).protocol, 'https:');
      assert.ok(!originals.has(still.image_url), `Frame reused for a different scene: ${place.id}`);
      originals.add(still.image_url);
      for (const asset of [still.src, still.thumbnail]) {
        assert.match(asset, /^\/images\/film-map\/[a-z0-9-]+\.jpg$/);
        const bytes = readFileSync(new URL(`../public${asset}`, import.meta.url));
        assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff');
        assert.equal(bytes.subarray(-2).toString('hex'), 'ffd9');
      }
    }
  }
  assert.deepEqual(missing.sort((a, b) => a.localeCompare(b)), ['ocean-view', 'tatiana']);
  assert.ok(originals.size > 100, 'The expanded catalog retains verified scene-specific frames');
  const summary = JSON.parse(readFileSync(new URL('../content/nyc_film_map_summary.json', import.meta.url), 'utf8'));
  assert.deepEqual(summary, { film_count: data.films.length, place_count: data.locations.length });
  for (const id of ['manhattan', 'annie-hall', 'hannah-and-her-sisters', 'manhattan-murder-mystery']) assert.ok(data.films.some((film) => film.id === id), id);
});
