import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  expansion_concepts,
  expansion_paths,
} from '../content/fixed_income_expansion.ts';
import { learning_checks } from '../content/mortgage_checks.ts';
import {
  mortgage_branches,
  mortgage_topics,
  mortgage_concepts,
  mortgage_relationships,
} from '../content/mortgage_concepts.ts';
import { search_concepts } from '../lib/mortgage_search.ts';
import {
  learning_index,
  initial_progress,
  select_lesson,
  read_progress,
  route_for_concept,
} from '../lib/mortgage_learning.ts';

test('one Mortgage Map includes every domain and concept in the catalog', () => {
  const ids = new Set(mortgage_concepts.map((c) => c.id));
  assert.equal(mortgage_topics.flatMap((t) => t.concepts).length, ids.size);
  for (const topic of mortgage_topics)
    assert.ok(
      topic.concepts.length && topic.concepts.every((id) => ids.has(id)),
    );
  for (const branch of mortgage_branches)
    assert.ok(mortgage_topics.some((t) => t.branch === branch.id));
  for (const id of ids) {
    assert.ok(learning_index.has(id));
    assert.ok(route_for_concept(id).steps.includes(id));
  }
  assert.equal(search_concepts('HELOC')[0].id, 'heloc');
});

test('lesson selection and saved position retain concepts across every Mortgage Map domain', () => {
  for (const id of [
    'interest_rate_swap',
    'heloc',
    'corporate',
    'municipal',
    'clo',
    'cny_rates',
  ]) {
    const selected = select_lesson(initial_progress, id);
    assert.equal(selected.current_id, id);
    assert.deepEqual(read_progress(JSON.stringify(selected)), selected);
    assert.equal(search_concepts(id)[0].id, id);
  }
});

test('new paths have authored step explanations, boundaries and complete public-source references', () => {
  for (const path of expansion_paths) {
    assert.ok(path.premise.length > 40 && path.boundary.length > 60);
    assert.equal(path.explanations.length, path.steps.length);
    for (const explanation of path.explanations)
      assert.ok(explanation.length > 35);
    for (const step of path.steps) assert.ok(learning_index.has(step));
  }
  for (const concept of expansion_concepts) {
    assert.ok(concept.sources.length);
    assert.ok(
      mortgage_relationships.some(
        (e) => e.source === concept.id || e.target === concept.id,
      ),
    );
  }
});

test('appraisal reduction separates amount, advance and control-test effects', () => {
  const concept = expansion_concepts.find(
    (node) => node.id === 'appraisal_reduction',
  );
  assert.ok(concept);
  assert.match(concept.summary, /overdue or advanced amounts/);
  assert.match(concept.summary, /escrows or reserves/);
  assert.match(concept.distinction, /three layers separate/);
  assert.match(
    concept.distinction,
    /interest portion of required P&I advances/,
  );
  assert.match(concept.distinction, /notional class-balance reductions/);
  assert.match(concept.distinction, /not actual principal write-downs/);
  assert.match(concept.distinction, /not a universal CMBS convention/);
  assert.ok(concept.sources.includes('benchmark_2026_v22_ara'));
  assert.ok(concept.links.some((link) => link.id === 'special_servicing'));
  assert.equal(learning_checks.appraisal_reduction.correct, 1);
  assert.match(
    learning_checks.appraisal_reduction.choices[1],
    /notionally reduce balances used in specified control tests/,
  );
});

test('future funding separates an unfunded lender duty from funded collateral principal', () => {
  const concept = expansion_concepts.find(
    (node) => node.id === 'future_funding_obligation',
  );
  assert.ok(concept);
  assert.equal(concept.topic, 'transitional_property');
  assert.equal(
    search_concepts('future advance obligation')[0]?.id,
    'future_funding_obligation',
  );
  assert.match(
    concept.summary,
    /separate from current funded collateral principal/,
  );
  assert.match(concept.distinction, /not automatically unrestricted cash/);
  assert.match(concept.distinction, /contract-specific/);
  assert.deepEqual(
    concept.links.map((link) => link.id),
    ['cre_clo', 'liquidity', 'cash_flows'],
  );
  assert.deepEqual(concept.sources, ['trtx_2025_fl6_future_funding']);
  const cre_clo = expansion_concepts.find((node) => node.id === 'cre_clo');
  assert.ok(
    cre_clo.links.some((link) => link.id === 'future_funding_obligation'),
  );
  for (const target of ['cre_clo', 'liquidity'])
    assert.ok(
      mortgage_relationships.some(
        (edge) =>
          edge.source === 'future_funding_obligation' && edge.target === target,
      ),
      target,
    );
  assert.equal(learning_checks.future_funding_obligation.correct, 1);
  assert.match(
    learning_checks.future_funding_obligation.choices[1],
    /unfunded lender obligation/,
  );
});
