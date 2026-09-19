import assert from 'node:assert/strict';
import { test } from 'node:test';
import { atlas_lenses, concept_in_lens } from '../content/fixed_income_lenses.ts';
import { expansion_concepts, expansion_paths } from '../content/fixed_income_expansion.ts';
import { mortgage_concepts, mortgage_relationships } from '../content/mortgage_concepts.ts';
import { lens_catalog, build_mortgage_graph, build_connection_graph, search_concepts, concept_index } from '../lib/mortgage_graph.ts';
import { initial_mortgage_state, mortgage_reducer } from '../lib/mortgage_state.ts';

test('lenses preserve shared identities, omit empty groups and lay out every visible concept without overlap', () => {
  for (const { id } of atlas_lenses) {
    const catalog = lens_catalog(id);
    const ids = new Set(catalog.concepts.map(c => c.id));
    assert.equal(catalog.topics.flatMap(t => t.concepts).length, ids.size);
    for (const topic of catalog.topics) assert.ok(topic.concepts.length && topic.concepts.every(c => ids.has(c)));
    for (const branch of catalog.branches) assert.ok(catalog.topics.some(t => t.branch === branch.id));
    for (const depth of [0, 1, 2]) {
      const nodes = build_mortgage_graph(depth, 'all', 'all', id);
      if (depth === 2) assert.deepEqual(new Set(nodes.filter(n => n.kind === 'concept').map(n => n.id)), ids);
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        assert.ok(Math.abs(a.x - b.x) >= (a.width + b.width) / 2 || Math.abs(a.y - b.y) >= (a.height + b.height) / 2, `${id}/${depth}: ${a.id}, ${b.id}`);
      }
    }
  }
  assert.equal(lens_catalog('fixed_income').concepts.length, mortgage_concepts.length);
  assert.ok(concept_in_lens(concept_index.get('interest_rate_swap'), 'mortgage'));
  assert.ok(concept_in_lens(concept_index.get('interest_rate_swap'), 'rates'));
  assert.ok(!concept_in_lens(concept_index.get('heloc'), 'rates'));
  assert.equal(search_concepts('HELOC')[0].id, 'heloc');
});

test('cross-lens search, history and URL restore reveal the selected concept without deleting reading history', () => {
  let state = mortgage_reducer(initial_mortgage_state, { type: 'change_lens', lens: 'rates' });
  const rate_connections = mortgage_reducer(state, { type: 'change_view', view: 'connections' });
  assert.equal(rate_connections.selected, 'interest_rate_swap');
  state = mortgage_reducer(state, { type: 'select_concept', id: 'interest_rate_swap', preserve_map_context: false });
  assert.equal(state.lens, 'rates');
  state = mortgage_reducer(state, { type: 'select_concept', id: 'heloc', preserve_map_context: false });
  assert.equal(state.lens, 'fixed_income');
  assert.equal(state.selected, 'heloc');
  state = mortgage_reducer(state, { type: 'change_lens', lens: 'rates' });
  assert.equal(state.selected, null);
  assert.equal(state.reader_open, false);
  assert.deepEqual(state.trail.ids, ['interest_rate_swap', 'heloc']);
  state = mortgage_reducer(state, { type: 'follow_history', offset: -1, preserve_map_context: false });
  assert.equal(state.selected, 'interest_rate_swap');
  state = mortgage_reducer(state, { type: 'follow_history', offset: 1, preserve_map_context: false });
  assert.equal(state.selected, 'heloc');
  assert.equal(state.lens, 'fixed_income');
  const restored = mortgage_reducer({ ...initial_mortgage_state, lens: 'rates' }, { type: 'restore_concept', id: 'heloc' });
  assert.equal(restored.lens, 'fixed_income');
  assert.equal(restored.view, 'connections');
  const neighbors = new Set(build_connection_graph('interest_rate_swap').map(n => n.id));
  for (const edge of mortgage_relationships.filter(e => [e.source, e.target].includes('interest_rate_swap'))) {
    assert.ok(neighbors.has(edge.source) && neighbors.has(edge.target));
  }
});

test('new paths have authored step explanations, boundaries and complete public-source references', () => {
  for (const path of expansion_paths) {
    assert.ok(path.premise.length > 40 && path.boundary.length > 60);
    assert.equal(path.explanations.length, path.steps.length);
    for (const explanation of path.explanations) assert.ok(explanation.length > 35);
    for (const step of path.steps) assert.ok(concept_index.has(step));
  }
  for (const concept of expansion_concepts) {
    assert.ok(concept.sources.length);
    assert.ok(mortgage_relationships.some(e => e.source === concept.id || e.target === concept.id));
  }
});
