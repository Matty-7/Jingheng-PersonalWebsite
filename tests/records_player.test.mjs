import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import Image from '../node_modules/vinext/dist/shims/image.js';

const require = createRequire(import.meta.url);
const cache = new Map();
function load_module(id) {
  if (id === 'next/image') return { default: Image };
  if (!id.startsWith('@/')) return require(id);
  const path = ['.tsx', '.ts', '']
    .map(
      (extension) => new URL(`../${id.slice(2)}${extension}`, import.meta.url),
    )
    .find(existsSync);
  assert.ok(path, `Module exists: ${id}`);
  if (id.endsWith('.json'))
    return { default: JSON.parse(readFileSync(path, 'utf8')) };
  if (cache.has(id)) return cache.get(id);
  const exports = {};
  cache.set(id, exports);
  const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(compiled, { exports, require: load_module, console });
  return exports;
}

test('record player renders ten labelled choices and one dormant audio element', () => {
  const { RecordsPlayer } = load_module('@/components/records_player');
  const html = renderToStaticMarkup(createElement(RecordsPlayer));
  const audio = [...html.matchAll(/<audio\b[^>]*>/g)].map(([tag]) => tag);
  assert.equal(audio.length, 1);
  assert.match(audio[0], /preload="none"/);
  assert.doesNotMatch(audio[0], /\b(?:src|autoPlay|autoplay)=/);
  assert.equal([...html.matchAll(/aria-label="Play preview:/g)].length, 10);
  assert.match(html, /id="records"/);
  assert.match(html, /aria-label="Preview playback progress"[^>]*value="0"/);
  assert.doesNotMatch(html, /aria-label="Current record"/);
  assert.match(html, /class="turntable\s*"/);
  assert.doesNotMatch(html, /(?:src|href)="\/images\/turntable(?:\.png|-base\.jpg)"/);
});
