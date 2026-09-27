import test from 'node:test';
import assert from 'node:assert/strict';
import { mortgage_concepts } from '../content/mortgage_concepts.ts';
import {
  initial_progress,
  learning_checks,
  select_lesson,
  learning_routes,
  local_tree,
  next_lesson,
  read_progress,
  read_position,
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

test('every concept has three distinct choices and one valid answer', () => {
  assert.deepEqual(
    Object.keys(learning_checks).sort(),
    mortgage_concepts.map((c) => c.id).sort(),
  );
  for (const concept of mortgage_concepts) {
    const check = learning_checks[concept.id];
    assert.equal(check.choices.length, 3, concept.id);
    assert.equal(
      new Set(check.choices.map((c) => c.trim().toLowerCase())).size,
      3,
      concept.id,
    );
    assert.ok(
      check.choices.every((c) => c.trim().length > 0),
      concept.id,
    );
    assert.ok(
      Number.isInteger(check.correct) &&
        check.correct >= 0 &&
        check.correct < 3,
      concept.id,
    );
  }
});

test('free jumps adopt the new lesson, keep completion and select a valid route', () => {
  const saved = { ...initial_progress, completed: ['incentive'] };
  const same_route = select_lesson(saved, 'prepayments');
  assert.equal(same_route.current_id, 'prepayments');
  assert.equal(same_route.route_id, saved.route_id);
  const other_topic = select_lesson(same_route, 'oas');
  assert.equal(other_topic.current_id, 'oas');
  assert.deepEqual(other_topic.completed, ['incentive']);
  assert.deepEqual(read_progress(JSON.stringify(other_topic)), other_topic);
  assert.deepEqual(select_lesson(other_topic, 'missing'), other_topic);
  const explicit_route = learning_routes.find(
    (r) => r.id !== 'borrower_decision' && r.steps.includes('incentive'),
  );
  assert.equal(
    select_lesson(other_topic, 'incentive', explicit_route.id).route_id,
    explicit_route.id,
  );
});

test('server position is bounded and validates untrusted cookie input', () => {
  for (const raw of [
    undefined,
    '%E0%A4%A',
    encodeURIComponent('{'),
    encodeURIComponent('{"current_id":"missing"}'),
  ]) {
    assert.deepEqual(read_position(raw), initial_progress);
  }
  const selected = select_lesson(initial_progress, 'loan_states');
  assert.deepEqual(
    read_position(
      encodeURIComponent(
        JSON.stringify({
          route_id: selected.route_id,
          current_id: selected.current_id,
        }),
      ),
    ),
    selected,
  );
});
