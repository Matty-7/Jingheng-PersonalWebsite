import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { google_place_url } from '../lib/google_maps.ts';

test('Google Maps links preserve destinations without an API key', () => {
  for (const query of [
    'McSorley’s Old Ale House, New York',
    'A & B #2 / Queens + NYC',
    '40.77,-73.96',
  ]) {
    const external = new URL(google_place_url(query));
    assert.equal(external.origin, 'https://www.google.com');
    assert.equal(external.pathname, '/maps/search/');
    assert.equal(external.searchParams.get('api'), '1');
    assert.equal(external.searchParams.get('query'), query);
    assert.equal(external.searchParams.has('key'), false);
  }
});

test('application sources keep the strict zero-charge Google Maps boundary', () => {
  const forbidden =
    /(?:maps\.googleapis\.com|places\.googleapis\.com|routes\.googleapis\.com|mapsplatform\.googleapis\.com|streetviewpublish\.googleapis\.com|maps\.google\.com\/maps\/api|google\.maps\.(?:Map|importLibrary)|@googlemaps\/|AIza[\w-]{30,})/;
  for (const root of ['app', 'components', 'lib']) {
    for (const path of readdirSync(new URL(`../${root}/`, import.meta.url), {
      recursive: true,
    })) {
      if (!/\.(?:[cm]?[jt]sx?|html)$/.test(path)) continue;
      const source = readFileSync(
        new URL(`../${root}/${path}`, import.meta.url),
        'utf8',
      );
      assert.equal(
        forbidden.test(source),
        false,
        `Metered Google API or hardcoded key in ${root}/${path}`,
      );
    }
  }
});
