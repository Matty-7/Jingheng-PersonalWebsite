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
    assert.ok(entry.excerpt && entry.locator && entry.precision && entry.note && entry.map_query);
    assert.equal(new URL(entry.source_url).protocol, 'https:');
    const [lat, lng] = entry.coordinates;
    assert.ok(lat > 40.49 && lat < 40.93 && lng > -74.26 && lng < -73.68);
  }
  assert.ok(catalog.works.some((work) => work.kind === 'The New Yorker'));
});
