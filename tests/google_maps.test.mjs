import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { google_place_embed_url, google_place_url } from '../lib/google_maps.ts';

test('Google map URLs use only the free Embed endpoint and preserve destinations', () => {
  for (const query of ['McSorley’s Old Ale House, New York', 'A & B #2 / Queens + NYC', '40.77,-73.96']) {
    const embedded = new URL(google_place_embed_url(query, 'test-only-key', 16));
    const external = new URL(google_place_url(query));
    assert.equal(embedded.origin, 'https://www.google.com');
    assert.equal(embedded.pathname, '/maps/embed/v1/place');
    assert.equal(embedded.searchParams.get('key'), 'test-only-key');
    assert.equal(embedded.searchParams.get('q'), query);
    assert.equal(embedded.searchParams.get('zoom'), '16');
    assert.equal(external.pathname, '/maps/search/');
    assert.equal(external.searchParams.get('api'), '1');
    assert.equal(external.searchParams.get('query'), query);
    assert.equal(external.searchParams.has('key'), false);
  }
});

test('missing configuration does not activate another Google API', () => {
  assert.equal(google_place_embed_url('New York', ''), null);
  assert.equal(google_place_embed_url('New York', '   '), null);
  assert.equal(new URL(google_place_url('New York')).searchParams.has('key'), false);
});

test('application sources keep the strict zero-charge Google Maps boundary', () => {
  const forbidden = /(?:maps\.googleapis\.com|places\.googleapis\.com|routes\.googleapis\.com|mapsplatform\.googleapis\.com|streetviewpublish\.googleapis\.com|maps\.google\.com\/maps\/api|google\.maps\.(?:Map|importLibrary)|@googlemaps\/|AIza[\w-]{30,})/;
  for (const root of ['app', 'components', 'lib']) {
    for (const path of readdirSync(new URL(`../${root}/`, import.meta.url), { recursive: true })) {
      if (!/\.(?:[cm]?[jt]sx?|html)$/.test(path)) continue;
      const source = readFileSync(new URL(`../${root}/${path}`, import.meta.url), 'utf8');
      assert.equal(forbidden.test(source), false, `Metered Google API or hardcoded key in ${root}/${path}`);
    }
  }
  for (const kind of ['film', 'literary', 'music']) {
    const page = readFileSync(new URL(`../app/portfolio/nyc-${kind}-map/page.tsx`, import.meta.url), 'utf8');
    const helper = readFileSync(new URL(`../lib/nyc_${kind}_map.ts`, import.meta.url), 'utf8');
    assert.ok(page.includes('google_maps_key={google_maps_embed_key()}'), `${kind}: missing shared key`);
    assert.ok(helper.includes('google_place_embed_url('), `${kind}: missing free helper`);
  }
});
