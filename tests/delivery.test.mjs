import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  runtime_image_paths,
  verify_asset,
} from '../scripts/check_delivery.mjs';

test('runtime inventory includes alias and relative JSON imports without retired content', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'site-assets-'));
  try {
    for (const name of ['app', 'components', 'lib', 'content']) {
      await mkdir(join(directory, name));
    }
    await writeFile(
      join(directory, 'app/page.tsx'),
      `import art from '@/content/art.json';`,
    );
    await writeFile(
      join(directory, 'lib/map.ts'),
      `import places from '../content/places.json' with { type: 'json' };`,
    );
    await writeFile(
      join(directory, 'components/photo.tsx'),
      `export const photo = '/images/shared.jpg';`,
    );
    await writeFile(
      join(directory, 'content/art.json'),
      JSON.stringify(['/images/art.jpg', '/images/shared.jpg']),
    );
    await writeFile(
      join(directory, 'content/places.json'),
      JSON.stringify(['/images/place.jpg', '/images/shared.jpg']),
    );
    await writeFile(
      join(directory, 'content/retired.json'),
      JSON.stringify(['/images/retired.jpg']),
    );
    assert.deepEqual(
      await runtime_image_paths(pathToFileURL(directory + '/')),
      ['/images/art.jpg', '/images/place.jpg', '/images/shared.jpg'],
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('every current film and literary catalog image is included in delivery checks', async () => {
  const paths = new Set(await runtime_image_paths());
  for (const name of ['nyc_film_locations', 'nyc_literary_locations']) {
    const source = await readFile(
      new URL(`../content/${name}.json`, import.meta.url),
      'utf8',
    );
    const references = [
      ...source.matchAll(
        /\/images\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|svg|ico)/g,
      ),
    ];
    assert.ok(references.length > 0);
    for (const [path] of references)
      assert.ok(paths.has(path), `${name}: missing ${path}`);
  }
});

test('a 200 response is insufficient when a gateway substitutes HTML or stale bytes', () => {
  const expected = Buffer.from([255, 216, 255, 224, 1, 2]);
  assert.doesNotThrow(() =>
    verify_asset('/images/test.jpg', 200, 'image/jpeg', expected, expected),
  );
  assert.throws(
    () =>
      verify_asset(
        '/images/test.jpg',
        200,
        'text/html',
        Buffer.from('<html>blocked</html>'),
        expected,
      ),
    /expected image\/jpeg/,
  );
  assert.throws(
    () =>
      verify_asset(
        '/images/test.jpg',
        200,
        'image/jpeg',
        Buffer.from('stale image'),
        expected,
      ),
    /bytes differ/,
  );
  assert.throws(
    () =>
      verify_asset('/images/test.jpg', 403, 'image/jpeg', expected, expected),
    /HTTP status/,
  );
});
