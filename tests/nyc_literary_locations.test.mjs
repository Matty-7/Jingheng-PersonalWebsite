import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const catalog = JSON.parse(readFileSync(new URL('../content/nyc_literary_locations.json', import.meta.url), 'utf8'));

test('literary places connect identifiable works, real covers and locatable original passages', () => {
  const works = new Map(catalog.works.map((work) => [work.id, work]));
  assert.equal(works.size, catalog.works.length);
  assert.equal(new Set(catalog.entries.map((entry) => entry.id)).size, catalog.entries.length);
  for (const work of works.values()) {
    assert.ok(catalog.entries.some((entry) => entry.work_id === work.id));
    assert.ok(work.cover.alt && work.cover.edition && work.cover.credit);
    assert.equal(new URL(work.cover.source_url).protocol, 'https:');
    assert.ok(existsSync(new URL(`../public${work.cover.src}`, import.meta.url)), work.id);
    const word_count = catalog.entries.filter((entry) => entry.work_id === work.id).reduce((sum, entry) => sum + entry.excerpt.split(/\s+/).length, 0);
    if (!work.rights.startsWith('Public domain')) assert.ok(word_count <= 25, work.id);
  }
  for (const entry of catalog.entries) {
    assert.ok(works.has(entry.work_id));
    assert.ok(entry.place_id && entry.excerpt && entry.locator && entry.precision && entry.note && entry.map_query);
    assert.equal(new URL(entry.source_url).protocol, 'https:');
    const [lat, lng] = entry.coordinates;
    assert.ok(lat > 40.49 && lat < 40.93 && lng > -74.26 && lng < -73.68);
  }
  assert.ok(catalog.works.some((work) => work.kind === 'The New Yorker'));
});


test('expanded readings have primary-source provenance and count repeated places once', () => {
  const provenance = JSON.parse(readFileSync(new URL('../content/nyc_literary_text_provenance.json', import.meta.url), 'utf8'));
  assert.equal(catalog.works.length, 19);
  assert.equal(catalog.entries.length, 43);
  assert.equal(new Set(catalog.entries.map((entry) => entry.place_id)).size, 40);
  const evidence = new Map(provenance.entries.map((entry) => [entry.entry_id, entry]));
  for (const entry of catalog.entries.slice(8)) {
    assert.equal(evidence.get(entry.id)?.source_url, entry.source_url, entry.id);
    assert.match(evidence.get(entry.id)?.source_file_sha256 ?? '', /^[a-f0-9]{64}$/);
  }
  for (const work of catalog.works) assert.match(work.cover.src, /\.jpg$/);
  const shared = catalog.entries.filter((entry) => entry.place_id === 'harlem');
  assert.deepEqual(new Set(shared.map((entry) => entry.work_id)), new Set(['quicksand', 'harlem']));
});


// Independent pair-code decoder, in integer 1/8000-degree units. Only the
// full ten-digit codes used by this catalog are accepted; no locality lookup.
function decode_pair_code(code) {
  assert.match(code, /^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2}$/);
  const alphabet = '23456789CFGHJMPQRVWX';
  const digits = code.replace('+', '');
  const low = [-90 * 8000, -180 * 8000];
  for (const [pair, scale] of [160000, 8000, 400, 20, 1].entries()) {
    for (let axis = 0; axis < 2; axis++) low[axis] += alphabet.indexOf(digits[pair * 2 + axis]) * scale;
  }
  return [low[0] / 8000, low[1] / 8000, (low[0] + 1) / 8000, (low[1] + 1) / 8000];
}

test('Plus Code validation agrees with official Open Location Code decoding vectors', () => {
  // https://github.com/google/open-location-code/blob/main/test_data/decoding.csv
  const fixtures = [
    ['7FG49QCJ+2V', [20.37, 2.782125, 20.370125, 2.78225]],
    ['8FVC2222+22', [47, 8, 47.000125, 8.000125]],
    ['4VCPPQGP+Q9', [-41.273125, 174.785875, -41.273, 174.786]],
    ['22222222+22', [-90, -180, -89.999875, -179.999875]],
  ];
  for (const [code, cell] of fixtures) assert.deepEqual(decode_pair_code(code), cell);
});

test('all literary pins use full Plus Codes containing the reviewed coordinates', () => {
  for (const entry of catalog.entries) {
    const [south, west, north, east] = decode_pair_code(entry.plus_code);
    const [latitude, longitude] = entry.coordinates;
    assert.ok(latitude >= south && latitude <= north && longitude >= west && longitude <= east, entry.id);
  }
});
