import assert from 'node:assert/strict';

// Independent pair-code decoder, in integer 1/8000-degree units. Only the
// full ten-digit codes used by this catalog are accepted; no locality lookup.
export function decode_pair_code(code) {
  assert.match(code, /^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2}$/);
  const alphabet = '23456789CFGHJMPQRVWX';
  const digits = code.replace('+', '');
  const low = [-90 * 8000, -180 * 8000];
  for (const [pair, scale] of [160000, 8000, 400, 20, 1].entries()) {
    for (let axis = 0; axis < 2; axis++)
      low[axis] += alphabet.indexOf(digits[pair * 2 + axis]) * scale;
  }
  return [
    low[0] / 8000,
    low[1] / 8000,
    (low[0] + 1) / 8000,
    (low[1] + 1) / 8000,
  ];
}
