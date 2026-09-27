import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const root = new URL('../dist/client/', import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL('.vite/manifest.json', root), 'utf8'),
);
const budgets = [
  { entry: 'app/page.tsx', raw: 630_000, gzip: 200_000 },
  { entry: 'components/new_york_atlas.tsx', raw: 960_000, gzip: 260_000 },
  { entry: 'components/mortgage_map.tsx', raw: 680_000, gzip: 205_000 },
];

for (const budget of budgets) {
  const visited = new Set();
  const files = new Set();
  function collect(entry) {
    if (visited.has(entry)) return;
    visited.add(entry);
    const chunk = manifest[entry];
    assert.ok(chunk, `Missing manifest entry: ${entry}`);
    assert.ok(
      chunk.file.endsWith('.js'),
      `Expected a JavaScript chunk: ${entry}`,
    );
    files.add(chunk.file);
    for (const dependency of chunk.imports ?? []) collect(dependency);
  }
  collect(budget.entry);
  const chunks = [...files].map((file) => readFileSync(new URL(file, root)));
  const raw = chunks.reduce((total, bytes) => total + bytes.length, 0);
  const gzip = chunks.reduce(
    (total, bytes) => total + gzipSync(bytes).length,
    0,
  );
  console.log(
    `${budget.entry}: ${raw}/${budget.raw} raw bytes; ${gzip}/${budget.gzip} gzip bytes (${files.size} static chunks)`,
  );
  assert.ok(
    raw <= budget.raw && gzip <= budget.gzip,
    `${budget.entry} exceeded its static JavaScript budget`,
  );
}
console.log(
  'Budgets cover each entry and its static imports, not full page transfer or field performance.',
);
