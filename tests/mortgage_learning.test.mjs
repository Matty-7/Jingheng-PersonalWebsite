import test from 'node:test';
import assert from 'node:assert/strict';
import { mortgage_concepts } from '../content/mortgage_concepts.ts';
import {
  initial_progress,
  learning_routes,
  local_tree,
  next_lesson,
  read_progress,
  refinancing_feedback,
  route_for_concept,
} from '../lib/mortgage_learning.ts';

test('every concept has an open learning route and a bounded local tree', () => {
  for (const concept of mortgage_concepts) {
    const route = route_for_concept(concept.id);
    assert.ok(route.steps.includes(concept.id), concept.id);
    const tree = local_tree(route, concept.id);
    assert.ok(tree.ids.length <= 6);
    assert.equal(new Set(tree.ids).size, tree.ids.length);
    assert.ok(
      tree.ids.every((id) => mortgage_concepts.some((item) => item.id === id)),
    );
  }
});

test('restoring progress validates route, position and completed concept IDs', () => {
  for (const raw of [
    null,
    '{',
    'null',
    '42',
    '{"route_id":"missing"}',
    JSON.stringify({ ...initial_progress, current_id: 'oas' }),
  ])
    assert.deepEqual(read_progress(raw), initial_progress);
  assert.deepEqual(
    read_progress(
      JSON.stringify({
        ...initial_progress,
        completed: ['incentive', 'missing', 'incentive', null],
      }),
    ).completed,
    ['incentive'],
  );
});

test('recommendation visits skipped foundations and eventually ends without a loop', () => {
  const route = learning_routes[0];
  let current = 'incentive';
  const completed = [];
  while (current) {
    assert.ok(!completed.includes(current));
    completed.push(current);
    current = next_lesson(route, current, completed);
  }
  assert.deepEqual(new Set(completed), new Set(route.steps));
  assert.equal(route_for_concept('oas', route.id).steps.includes('oas'), true);
  assert.equal(route_for_concept('cash_flows', route.id).id, route.id);
});

test('rate illustration distinguishes lower, equal and higher replacement rates', () => {
  assert.match(refinancing_feedback(5).title, /Stronger/);
  assert.match(refinancing_feedback(6.5).title, /No rate advantage/);
  assert.match(refinancing_feedback(9).title, /Less incentive/);
});
