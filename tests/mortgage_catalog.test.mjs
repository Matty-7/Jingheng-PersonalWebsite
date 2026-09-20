import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expansion_concepts, expansion_paths } from '../content/fixed_income_expansion.ts';
import { mortgage_branches, mortgage_topics, mortgage_concepts, mortgage_relationships } from '../content/mortgage_concepts.ts';
import { build_mortgage_graph, build_connection_graph, search_concepts, concept_index } from '../lib/mortgage_graph.ts';
import { initial_mortgage_state, mortgage_reducer } from '../lib/mortgage_state.ts';

test('one Mortgage Map includes every domain and concept at every hierarchy depth without overlap', () => {
  const ids = new Set(mortgage_concepts.map(c => c.id));
  assert.equal(mortgage_topics.flatMap(t => t.concepts).length, ids.size);
  for (const topic of mortgage_topics) assert.ok(topic.concepts.length && topic.concepts.every(id => ids.has(id)));
  for (const branch of mortgage_branches) assert.ok(mortgage_topics.some(t => t.branch === branch.id));
  for (const depth of [0, 1, 2]) {
    const nodes = build_mortgage_graph(depth);
    assert.equal(nodes.find(n => n.kind === 'root').title, 'Mortgage Map');
    assert.deepEqual(new Set(nodes.filter(n => n.kind === 'branch').map(n => n.id)), new Set(mortgage_branches.map(b => b.id)));
    if (depth === 2) assert.deepEqual(new Set(nodes.filter(n => n.kind === 'concept').map(n => n.id)), ids);
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      assert.ok(Math.abs(a.x - b.x) >= (a.width + b.width) / 2 || Math.abs(a.y - b.y) >= (a.height + b.height) / 2, `${depth}: ${a.id}, ${b.id}`);
    }
  }
  for (const id of ['interest_rate_swap', 'heloc', 'corporate', 'municipal', 'clo', 'cny_rates']) {
    const concept = concept_index.get(id);
    assert.ok(concept);
    const branch_nodes = build_mortgage_graph(2, concept.branch);
    assert.ok(branch_nodes.some(n => n.id === id));
  }
  assert.equal(search_concepts('HELOC')[0].id, 'heloc');
});

test('search, reading history and URL restore retain concepts across every Mortgage Map domain', () => {
  let state = initial_mortgage_state;
  const connections = mortgage_reducer(state, { type: 'change_view', view: 'connections' });
  assert.equal(connections.selected, 'prepayments');
  for (const id of ['interest_rate_swap', 'heloc', 'corporate']) {
    state = mortgage_reducer(state, { type: 'select_concept', id, preserve_map_context: false });
    assert.equal(state.selected, id);
    assert.ok(build_mortgage_graph(state.depth, state.branch_filter, state.topic_filter).some(n => n.id === id));
  }
  assert.deepEqual(state.trail.ids, ['interest_rate_swap', 'heloc', 'corporate']);
  state = mortgage_reducer(state, { type: 'follow_history', offset: -1, preserve_map_context: false });
  assert.equal(state.selected, 'heloc');
  state = mortgage_reducer(state, { type: 'follow_history', offset: 1, preserve_map_context: false });
  assert.equal(state.selected, 'corporate');
  for (const id of ['heloc', 'corporate', 'cny_rates']) {
    const restored = mortgage_reducer(initial_mortgage_state, { type: 'restore_concept', id });
    assert.equal(restored.selected, id);
    assert.equal(restored.view, 'connections');
  }
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
