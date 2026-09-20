import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mortgage_concepts, mortgage_relationships, mortgage_sources } from '../content/mortgage_concepts.ts';
import { build_connection_graph, concept_index, search_concepts } from '../lib/mortgage_graph.ts';
import { initial_mortgage_state, mortgage_reducer } from '../lib/mortgage_state.ts';
import { mortgage_math } from '../lib/mortgage_math.ts';

test('dollar-roll quotation has explicit units, sign, limits and a counterexample', () => {
  const rolls = concept_index.get('rolls');
  assert.equal(mortgage_concepts.filter(c => c.id === 'rolls').length, 1);
  assert.match(rolls.summary, /sell-near \/ buy-far/);
  assert.match(rolls.formula.assumptions, /clean-price points per \$100 current face/);
  assert.match(rolls.formula.assumptions, /negative drop/);
  assert.match(rolls.formula.example, /not a 0.25% investment return/);
  assert.equal(99.625 - 99.375, 0.250);
  assert.match(mortgage_math.rolls.variables, /Not a percentage return or annualized rate/);
  assert.match(rolls.distinction, /Principal.*not all profit/);
  assert.match(rolls.answer, /Forgone payments can outweigh the drop and any funding benefit/);
  assert.match(mortgage_sources.dollar_roll_faq.title, /2014 archive/);
  assert.equal(search_concepts('roll drop')[0].id, 'rolls');
});

test('roll cash flows, prepayments, delivery and repo are explicit sourced graph connections', () => {
  const neighbors = new Set(build_connection_graph('rolls').map(n => n.id));
  for (const id of ['cash_flows', 'prepayments', 'cheapest_deliverable', 'repo']) {
    assert.ok(neighbors.has(id), id);
    const edge = mortgage_relationships.find(e =>
      (e.source === 'rolls' && e.target === id) || (e.target === 'rolls' && e.source === id));
    assert.equal(edge.kind, id === 'repo' ? 'comparison' : 'mechanism');
    assert.ok(edge.conditions && edge.sources.length);
    for (const source of edge.sources) assert.ok(mortgage_sources[source]);
  }
});

test('a rates repo reader can follow the mortgage roll comparison without losing history', () => {
  let state = mortgage_reducer(initial_mortgage_state, { type: 'change_lens', lens: 'rates' });
  state = mortgage_reducer(state, { type: 'select_concept', id: 'repo', preserve_map_context: false });
  assert.equal(state.lens, 'rates');
  state = mortgage_reducer(state, { type: 'select_concept', id: 'rolls', preserve_map_context: false });
  assert.equal(state.lens, 'fixed_income');
  state = mortgage_reducer(state, { type: 'follow_history', offset: -1, preserve_map_context: false });
  assert.equal(state.selected, 'repo');
  state = mortgage_reducer(state, { type: 'follow_history', offset: 1, preserve_map_context: false });
  assert.equal(state.selected, 'rolls');
  assert.deepEqual(state.trail.ids, ['repo', 'rolls']);
});
