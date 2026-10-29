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
  mortgage_sources,
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

test('data-center CRE separates contracted capacity from mortgage repayment', () => {
  const concept = expansion_concepts.find(
    (node) => node.id === 'data_center_cre',
  );
  assert.ok(concept);
  assert.equal(concept.branch, 'credit');
  assert.equal(concept.topic, 'property_income');
  assert.match(concept.summary, /planned, contracted, utility-served/);
  assert.match(concept.distinction, /strong tenant and a long lease/i);
  assert.match(concept.distinction, /landlord performance/i);
  assert.match(concept.formula.expression, /min\(DSCR limit, LTV limit\)/);
  assert.match(concept.formula.expression, /refinance gap = max\(0,/);
  assert.match(
    concept.formula.assumptions,
    /same currency and valuation date/i,
  );
  assert.match(
    concept.formula.assumptions,
    /not a commitment, appraisal, forecast or market quote/i,
  );
  assert.deepEqual(concept.sources, [
    'cre',
    'doe_data_center_power_2024',
    'applied_digital_2026_10k',
  ]);
  for (const query of [
    'data center CRE',
    'contracted MW',
    'energized capacity',
    'critical IT load',
  ])
    assert.equal(search_concepts(query)[0]?.id, 'data_center_cre');
  assert.equal(learning_checks.data_center_cre.correct, 2);
  assert.equal(learning_checks.data_center_cre.choices.length, 3);
  const path = expansion_paths.find(
    (item) => item.id === 'data_center_repayment',
  );
  assert.deepEqual(path.steps, [
    'data_center_cre',
    'rent_roll',
    'noi',
    'dscr',
    'refinance_risk',
    'cmbs',
    'cre_clo',
  ]);
  assert.match(
    path.boundary,
    /alternative financing or securitization contexts/i,
  );
  for (const target of ['rent_roll', 'noi', 'dscr', 'refinance_risk']) {
    const edge = mortgage_relationships.find(
      (item) => item.source === 'data_center_cre' && item.target === target,
    );
    assert.ok(edge, target);
    assert.ok(edge.sources?.length, target);
  }
});

test('MBS supply and demand separates allocation from intermediation', () => {
  const concept = mortgage_concepts.find((node) => node.id === 'supply_demand');
  assert.ok(concept);
  assert.match(
    concept.summary,
    /mandates and duration, credit and prepayment-option limits/,
  );
  assert.match(concept.summary, /shared balance-sheet capacity/);
  assert.match(concept.distinction, /does not mechanically widen/);
  assert.match(concept.distinction, /greater dealer capacity/);
  assert.match(
    concept.distinction,
    /co-movement alone does not identify the cause/,
  );
  assert.equal(search_concepts('cross-asset supply')[0]?.id, 'supply_demand');
  for (const source of [
    'dealer_capacity_2024',
    'portfolio_balance_2019',
    'mbs_supply_overview_2022',
  ])
    assert.ok(mortgage_sources[source], source);
  assert.equal(learning_checks.supply_demand.correct, 0);
  assert.match(
    learning_checks.supply_demand.choices[0],
    /Investor demand and dealer capacity can absorb supply/,
  );
  const liquidity = mortgage_relationships.find(
    (edge) => edge.id === 'model_supply_demand__liquidity',
  );
  assert.match(liquidity?.conditions, /does not draw from one fixed/);
  const spreads = mortgage_relationships.find(
    (edge) => edge.id === 'model_supply_demand__spreads',
  );
  assert.match(spreads?.conditions, /not sufficient evidence/);
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

test('TBA analytics mapping separates a collateral proxy from contract and delivery', () => {
  const concept = mortgage_concepts.find(
    (node) => node.id === 'tba_analytics_mapping',
  );
  assert.ok(concept);
  assert.equal(concept.topic, 'pool_selection');
  assert.equal(search_concepts('TBA proxy')[0]?.id, 'tba_analytics_mapping');
  assert.equal(
    search_concepts('generic TBA analytics')[0]?.id,
    'tba_analytics_mapping',
  );
  assert.match(concept.summary, /not a delivery promise/);
  assert.match(
    concept.distinction,
    /loan balance here is not the trade notional/,
  );
  assert.match(concept.distinction, /without loans aging overnight/);
  assert.deepEqual(
    concept.links.map((link) => link.id),
    ['tba', 'pool_averages', 'oas', 'duration', 'model_risk'],
  );
  assert.deepEqual(concept.sources, [
    'tba',
    'tba_analytics_public',
    'fannie_mbs_basics',
  ]);
  for (const target of ['oas', 'duration'])
    assert.ok(
      mortgage_relationships.some(
        (edge) =>
          edge.source === 'tba_analytics_mapping' && edge.target === target,
      ),
      target,
    );
  assert.equal(learning_checks.tba_analytics_mapping.correct, 1);
  assert.match(
    learning_checks.tba_analytics_mapping.choices[1],
    /Different collateral assumptions can change projected cash flows/,
  );
});

test('TBA allocation separates proxy collateral, notification, good delivery and settlement', () => {
  const concept = mortgage_concepts.find(
    (node) => node.id === 'tba_allocation',
  );
  assert.ok(concept);
  assert.equal(concept.topic, 'market_mechanics');
  for (const query of [
    '48-hour day',
    'pool notification',
    'good delivery',
    'TBA allocation',
  ])
    assert.equal(search_concepts(query)[0]?.id, 'tba_allocation', query);
  assert.match(concept.distinction, /market-calendar designation/);
  assert.match(concept.distinction, /not a delivery instruction/);
  assert.match(concept.distinction, /does not certify/);
  assert.deepEqual(
    concept.links.map((link) => link.id),
    [
      'tba',
      'tba_analytics_mapping',
      'settlement',
      'pool_averages',
      'settlement_cashflow_dates',
    ],
  );
  for (const source of concept.sources) assert.ok(mortgage_sources[source]);
  for (const edge_id of [
    'tba__tba_allocation',
    'tba_analytics_mapping__tba_allocation',
    'tba_allocation__settlement',
  ])
    assert.ok(
      mortgage_relationships.some((edge) => edge.id === edge_id),
      edge_id,
    );
  assert.equal(learning_checks.tba_allocation.correct, 1);
  assert.match(
    learning_checks.tba_allocation.choices[1],
    /later allocation notice identifies proposed pools/,
  );
});
