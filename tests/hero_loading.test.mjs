import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import Image from '../node_modules/vinext/dist/shims/image.js';

const require = createRequire(import.meta.url);

function load_component(name) {
  const path = new URL(`../components/${name}`, import.meta.url);
  const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (id) => {
      if (id === 'next/image') return { default: Image };
      if (id === './scene_motion') return load_component('scene_motion.tsx');
      if (id === './image_status') return load_component('image_status.ts');
      return require(id);
    },
  });
  return exports;
}

test('the rendered hero is discoverable before layout and preloads one high-priority JPEG', () => {
  const { RoomScene } = load_component('room_scene.tsx');
  const html = renderToStaticMarkup(createElement(RoomScene, {
    paused: false,
    on_toggle: () => {},
  }));
  const hero = html.match(/<img\b[^>]*class="room-background"[^>]*>/)?.[0];
  assert.ok(hero, 'Hero must be present in server HTML');
  assert.match(hero, /loading="eager"/);
  assert.match(hero, /fetchPriority="high"/);
  const preloads = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => tag.includes('href="/images/living-room-motion.jpg"'));
  assert.equal(preloads.length, 1, 'All room layers share one preload');
  assert.match(preloads[0], /rel="preload"/);
  assert.match(preloads[0], /as="image"/);
  assert.match(preloads[0], /fetchPriority="high"/);
});

test('the LCP artwork stays within its JPEG transfer budget', () => {
  const bytes = readFileSync(new URL('../public/images/living-room-motion.jpg', import.meta.url));
  assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.ok(bytes.length <= 210_000, `Hero exceeded 210 KB: ${bytes.length} bytes`);
});
