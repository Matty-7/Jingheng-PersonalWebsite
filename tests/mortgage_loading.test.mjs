import test from 'node:test';
import assert from 'node:assert/strict';
import { create_learning_store } from '../lib/mortgage_progress_store.ts';
import { create_lesson_loader } from '../lib/mortgage_lesson_loader.ts';
import { create_learning_model } from '../lib/mortgage_learning_state.ts';
import {
  initial_progress,
  learning_navigation,
  learning_routes,
  select_lesson,
} from '../lib/mortgage_learning.ts';
import { mortgage_lesson } from '../lib/mortgage_lesson.ts';
import { mortgage_catalog_data } from '../lib/mortgage_catalog_data.ts';
import { search_catalog } from '../lib/mortgage_search_core.ts';
import { search_concepts } from '../lib/mortgage_search.ts';

const model = create_learning_model(learning_navigation, learning_routes);
const initial_lesson = mortgage_lesson(initial_progress.current_id);
const settle = () => new Promise((resolve) => setImmediate(resolve));

test('navigation metadata and search projection preserve the full catalog without lesson bodies', () => {
  assert.ok(
    learning_navigation.every(
      (entry) =>
        !('answer' in entry) && !('summary' in entry) && !('formula' in entry),
    ),
  );
  for (const query of [
    'OAS',
    'IRS',
    'HELOC',
    'mortgage',
    'prepayment',
    'cash flow',
    '',
  ]) {
    assert.deepEqual(
      search_catalog(mortgage_catalog_data.concepts, query).map(
        (entry) => entry.id,
      ),
      search_concepts(query).map((entry) => entry.id),
    );
  }
  assert.equal(mortgage_lesson('missing'), null);
  const lesson = mortgage_lesson('cpr');
  assert.match(lesson.formula.html, /<math/);
  assert.deepEqual(
    Object.keys(lesson.sources).sort(),
    [...lesson.concept.sources].sort(),
  );
  assert.ok(!('formulas' in lesson));
});

test('lesson loading deduplicates requests and rejects a mismatched response without caching it', async (t) => {
  const requests = [];
  t.mock.method(
    globalThis,
    'fetch',
    () => new Promise((resolve) => requests.push(resolve)),
  );
  const loader = create_lesson_loader(initial_lesson);
  const first = loader.load('cpr');
  assert.equal(loader.load('cpr'), first);
  assert.equal(requests.length, 1);
  requests[0](Response.json(mortgage_lesson('oas')));
  await assert.rejects(first, /Mismatched/);
  const second = loader.load('cpr');
  requests[1](Response.json(mortgage_lesson('cpr')));
  await second;
  assert.equal(loader.load('cpr').concept.id, 'cpr');
});

test('slow older selection never overwrites a newer lesson or its navigation callback', async (t) => {
  const requests = new Map();
  t.mock.method(
    globalThis,
    'fetch',
    (url) =>
      new Promise((resolve) =>
        requests.set(
          new URL(url, 'https://example.org').searchParams.get('concept'),
          resolve,
        ),
      ),
  );
  const store = create_learning_store(initial_progress, initial_lesson, model);
  const commits = [];
  store.set_progress(select_lesson(initial_progress, 'cpr'), () =>
    commits.push('cpr'),
  );
  assert.equal(store.get_snapshot().progress.current_id, 'incentive');
  assert.equal(store.get_snapshot().lesson.concept.id, 'incentive');
  store.set_progress(select_lesson(initial_progress, 'oas'), () =>
    commits.push('oas'),
  );
  requests.get('oas')(Response.json(mortgage_lesson('oas')));
  await settle();
  requests.get('cpr')(Response.json(mortgage_lesson('cpr')));
  await settle();
  assert.equal(store.get_snapshot().progress.current_id, 'oas');
  assert.equal(store.get_snapshot().lesson.concept.id, 'oas');
  assert.deepEqual(commits, ['oas']);
});

test('failure preserves the displayed lesson and completed work, and retry commits the intended lesson', async (t) => {
  let succeeds = false;
  t.mock.method(globalThis, 'fetch', async () =>
    succeeds
      ? Response.json(mortgage_lesson('prepayments'))
      : new Response('', { status: 503 }),
  );
  const store = create_learning_store(initial_progress, initial_lesson, model);
  store.set_progress({ ...initial_progress, completed: ['incentive'] });
  store.set_progress((current) => model.select_lesson(current, 'prepayments'));
  assert.equal(store.get_snapshot().has_committed, true);
  assert.deepEqual(store.get_snapshot().progress.completed, ['incentive']);
  await settle();
  assert.equal(store.get_snapshot().failed, true);
  assert.equal(store.get_snapshot().progress.current_id, 'incentive');
  assert.deepEqual(store.get_snapshot().progress.completed, ['incentive']);
  succeeds = true;
  store.retry();
  await settle();
  assert.equal(store.get_snapshot().progress.current_id, 'prepayments');
  assert.equal(store.get_snapshot().lesson.concept.id, 'prepayments');
  assert.deepEqual(store.get_snapshot().progress.completed, ['incentive']);
  assert.equal(store.get_snapshot().pending_id, null);
});

test('a failed initial restoration never makes the server fallback persistable', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('', { status: 503 }),
  );
  const store = create_learning_store(initial_progress, initial_lesson, model);
  const saved = {
    ...model.select_lesson(initial_progress, 'cpr'),
    completed: ['incentive'],
  };
  store.set_progress(saved);
  await settle();
  assert.equal(store.get_snapshot().loaded, true);
  assert.equal(store.get_snapshot().failed, true);
  assert.equal(store.get_snapshot().has_committed, false);
  assert.equal(store.get_snapshot().progress, initial_progress);
});
