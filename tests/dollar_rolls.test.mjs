import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  mortgage_concepts,
  mortgage_relationships,
  mortgage_sources,
} from '../content/mortgage_concepts.ts';
import { search_concepts } from '../lib/mortgage_search.ts';
import {
  learning_index,
  initial_progress,
  select_lesson,
  read_progress,
} from '../lib/mortgage_learning.ts';

import { mortgage_math } from '../lib/mortgage_math.ts';

test('dollar-roll quotation has explicit units, sign, limits and a counterexample', () => {
  const rolls = learning_index.get('rolls');
  assert.equal(mortgage_concepts.filter((c) => c.id === 'rolls').length, 1);
  assert.match(rolls.summary, /sell-near \/ buy-far/);
  assert.match(
    rolls.formula.assumptions,
    /clean-price points per \$100 current face/,
  );
  assert.match(rolls.formula.assumptions, /negative drop/);
  assert.match(rolls.formula.example, /not a 0.25% investment return/);
  assert.equal(99.625 - 99.375, 0.25);
  assert.match(
    mortgage_math.rolls.variables,
    /Not a percentage return or annualized rate/,
  );
  assert.match(rolls.distinction, /Principal.*not all profit/);
  assert.match(
    rolls.answer,
    /Forgone payments can outweigh the drop and any funding benefit/,
  );
  assert.match(mortgage_sources.dollar_roll_faq.title, /2014 archive/);
  assert.equal(search_concepts('roll drop')[0].id, 'rolls');
});

test('roll cash flows, prepayments, delivery and repo are explicit sourced graph connections', () => {
  for (const id of [
    'cash_flows',
    'prepayments',
    'cheapest_deliverable',
    'repo',
  ]) {
    const edge = mortgage_relationships.find(
      (e) =>
        (e.source === 'rolls' && e.target === id) ||
        (e.target === 'rolls' && e.source === id),
    );
    assert.ok(edge, id);
    assert.equal(edge.kind, id === 'repo' ? 'comparison' : 'mechanism');
    assert.ok(edge.conditions && edge.sources.length);
    for (const source of edge.sources) assert.ok(mortgage_sources[source]);
  }
});

test('a repo lesson can jump to dollar rolls and restore its saved position', () => {
  const repo = select_lesson(initial_progress, 'repo');
  const rolls = select_lesson({ ...repo, completed: ['repo'] }, 'rolls');
  assert.equal(rolls.current_id, 'rolls');
  assert.deepEqual(rolls.completed, ['repo']);
  assert.deepEqual(read_progress(JSON.stringify(rolls)), rolls);
});
