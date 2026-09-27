import assert from 'node:assert/strict';
import test from 'node:test';
import { decode_pair_code } from './helpers/plus_code.mjs';

test('Plus Code validation agrees with official Open Location Code decoding vectors', () => {
  // https://github.com/google/open-location-code/blob/main/test_data/decoding.csv
  const fixtures = [
    ['7FG49QCJ+2V', [20.37, 2.782125, 20.370125, 2.78225]],
    ['8FVC2222+22', [47, 8, 47.000125, 8.000125]],
    ['4VCPPQGP+Q9', [-41.273125, 174.785875, -41.273, 174.786]],
    ['22222222+22', [-90, -180, -89.999875, -179.999875]],
  ];
  for (const [code, cell] of fixtures)
    assert.deepEqual(decode_pair_code(code), cell);
});
