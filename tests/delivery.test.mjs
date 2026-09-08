import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verify_asset } from '../scripts/check_delivery.mjs';

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
