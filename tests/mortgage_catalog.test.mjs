import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  expansion_concepts,
  expansion_paths,
  expansion_relationships,
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

test('refinance transitions separate completed replacement from rate incentive and pool speed', () => {
  const concept = mortgage_concepts.find(
    (node) => node.id === 'refinance_transition',
  );
  assert.ok(concept);
  assert.equal(concept.branch, 'prepayment');
  assert.equal(concept.topic, 'prepayment_response');
  assert.equal(concept.formula, undefined);
  assert.match(concept.summary, /cash-out refinance may retire a first lien/i);
  assert.match(concept.distinction, /not market-wide refinance volume/i);
  assert.match(concept.distinction, /not.*pool CPR/i);
  assert.match(concept.distinction, /borrower’s causal motive/i);
  assert.match(
    concept.distinction,
    /HELOC may provide equity access while preserving/i,
  );
  for (const source of [
    'fannie_refinance_transition_2026',
    'freddie_refinance_product_transition',
    'fhfa_refinance_2q26',
    'cfpb_cash_out_nmdb',
  ]) {
    assert.ok(mortgage_sources[source], source);
    assert.ok(concept.sources.includes(source), source);
  }
  for (const target of [
    'incentive',
    'prepayments',
    'fixed_arm',
    'second_lien',
    'prepayment_aggregation',
  ])
    assert.ok(
      concept.links.some((link) => link.id === target),
      target,
    );
  for (const edge of mortgage_relationships.filter(
    (item) =>
      item.source === 'refinance_transition' ||
      item.target === 'refinance_transition',
  )) {
    assert.ok(edge.sources?.length, edge.id);
    assert.match(edge.conditions, /population|provider-specific/i, edge.id);
    assert.match(edge.conditions, /descriptive|non-causal|causal/i, edge.id);
  }
  assert.equal(learning_checks.refinance_transition.correct, 1);
  assert.match(
    learning_checks.refinance_transition.choices[1],
    /does not prove motive or measure pool CPR/i,
  );
});

test('Treasury financing flow separates quarterly estimates, refunding and auction cash', () => {
  const concept = mortgage_concepts.find(
    (node) => node.id === 'treasury_financing_flow',
  );
  assert.ok(concept);
  assert.equal(concept.branch, 'curves');
  assert.equal(concept.topic, 'treasury_foundations');
  assert.match(concept.summary, /quarterly borrowing estimate/i);
  assert.match(
    concept.summary,
    /gross offering less privately held maturities/i,
  );
  assert.match(concept.distinction, /auction size is security-level/i);
  assert.match(concept.distinction, /SOMA rollover add-ons/i);
  assert.match(
    concept.distinction,
    /none of these figures alone determines.*MBS spreads or OAS/i,
  );
  assert.match(concept.formula.expression, /gross refunding offering/);
  assert.match(
    concept.formula.assumptions,
    /holder and settlement bases must align/i,
  );
  assert.match(concept.formula.example, /125 billion.*97 billion.*28 billion/i);
  assert.match(concept.formula.example, /618 billion.*850 billion/i);
  for (const source of [
    'treasury_borrowing_estimate_2026_11_02',
    'treasury_refunding_2026_11_04',
    'treasurydirect_auction_announcements',
  ]) {
    assert.ok(mortgage_sources[source], source);
    assert.ok(concept.sources.includes(source), source);
  }
  for (const target of [
    'treasury_family',
    'qe_qt',
    'supply_demand',
    'term_premium',
    'current_coupon',
  ]) {
    assert.ok(
      concept.links.some((link) => link.id === target),
      target,
    );
    const edge = mortgage_relationships.find(
      (item) =>
        item.source === 'treasury_financing_flow' && item.target === target,
    );
    assert.ok(edge, target);
    assert.ok(edge.sources?.length, target);
    assert.ok(edge.conditions.length > 60, target);
  }
  assert.equal(learning_checks.treasury_financing_flow.correct, 1);
  assert.match(
    learning_checks.treasury_financing_flow.choices[1],
    /28 billion.*quarterly estimate is broader/i,
  );
  assert.equal(
    search_concepts('TGA cash balance')[0]?.id,
    'treasury_financing_flow',
  );
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
  assert.match(concept.formula.expression, /net transactions/);
  assert.match(concept.formula.expression, /valuation changes/);
  assert.match(concept.formula.assumptions, /principal paydowns/);
  assert.match(
    concept.distinction,
    /do not by themselves prove active selling/,
  );
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
    'financial_accounts_instruments_public',
    'bank_mbs_holdings_public',
    'bank_mbs_reporting_notes_public',
  ])
    assert.ok(mortgage_sources[source], source);
  assert.ok(concept.links.some((link) => link.id === 'prepayments'));
  for (const source of [
    'financial_accounts_instruments_public',
    'bank_mbs_holdings_public',
    'bank_mbs_reporting_notes_public',
  ])
    assert.ok(concept.sources.includes(source), source);
  assert.equal(learning_checks.supply_demand.correct, 0);
  assert.match(
    learning_checks.supply_demand.choices[0],
    /reconcile transactions and stocks/,
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

test('sector diversification separates contracts from shared market channels', () => {
  const concept = mortgage_concepts.find(
    (node) => node.id === 'conditional_sector_diversification',
  );
  assert.ok(concept);
  assert.equal(concept.branch, 'risk');
  assert.equal(concept.topic, 'exposure_channels');
  assert.match(concept.summary, /Agency MBS, non-agency RMBS, CMBS, CLOs/);
  assert.match(concept.summary, /does not establish independence/i);
  assert.match(concept.summary, /not established by this source/i);
  assert.match(concept.summary, /without combining them into a score/i);
  assert.match(concept.summary, /conditional on actual holdings, financing/);
  assert.match(
    concept.distinction,
    /Diversifying repayment contracts and collateral is not the same/i,
  );
  assert.match(concept.distinction, /covers corporate bonds only/i);
  assert.match(concept.distinction, /dated framework and snapshot/i);
  assert.match(concept.formula.expression, /DV01/);
  assert.match(concept.formula.assumptions, /one valuation date and currency/i);
  assert.match(
    concept.formula.assumptions,
    /positive currency loss magnitude per 1 bp/i,
  );
  assert.match(concept.formula.assumptions, /\+1 bp.*−DV01/i);
  assert.match(concept.formula.assumptions, /do not estimate correlation/i);
  for (const source of [
    'agency_mbs_funding_liquidity_2016',
    'debt_fire_sale_framework_2021',
    'global_credit_cycle_2026',
    'agency_mbs_dealer_stress_2026',
    'yield_duration_public',
  ]) {
    assert.ok(mortgage_sources[source], source);
    assert.ok(concept.sources.includes(source), source);
  }
  for (const target of [
    'agency',
    'non_agency',
    'clo',
    'corporate',
    'liquidity',
  ]) {
    assert.ok(
      concept.links.some((link) => link.id === target),
      target,
    );
    const edge = mortgage_relationships.find(
      (item) =>
        item.source === 'conditional_sector_diversification' &&
        item.target === target,
    );
    assert.ok(edge, target);
    assert.ok(edge.sources?.length, target);
    assert.ok(edge.conditions?.length > 60, target);
  }
  const corporate = mortgage_relationships.find(
    (edge) => edge.id === 'model_conditional_sector_diversification__corporate',
  );
  assert.match(corporate.conditions, /Do not extrapolate/i);
  const liquidity = mortgage_relationships.find(
    (edge) => edge.id === 'model_conditional_sector_diversification__liquidity',
  );
  assert.match(liquidity.conditions, /dated framework and snapshot/i);
  assert.equal(learning_checks.conditional_sector_diversification.correct, 1);
  assert.match(
    learning_checks.conditional_sector_diversification.choices[1],
    /cannot be assumed to apply directly to MBS/i,
  );
  assert.equal(
    search_concepts('shared liquidation risk')[0]?.id,
    'conditional_sector_diversification',
  );
});

test('property insurance transmission separates hazard from mortgage and security loss', () => {
  const concept = mortgage_concepts.find(
    (node) => node.id === 'property_insurance_transmission',
  );
  assert.ok(concept);
  assert.equal(concept.branch, 'credit');
  assert.equal(concept.topic, 'collateral_insurance');
  assert.match(
    concept.summary,
    /Hazard exposure.*not an observed mortgage loss/i,
  );
  assert.match(
    concept.summary,
    /A realized mortgage loss is measured from the applicable default, workout and recovery outcomes/i,
  );
  assert.doesNotMatch(concept.summary, /recognized only after/i);
  assert.match(concept.summary, /Spatially correlated collateral/i);
  assert.match(concept.distinction, /Hazard is not damage/i);
  assert.match(concept.distinction, /pool loss is not automatically a loss/i);
  assert.match(concept.distinction, /aggregate and non-causal/i);
  assert.equal(concept.formula, undefined);
  for (const source of [
    'fhfa_climate_summit_2024',
    'fhfa_annual_report_2024_insurance',
    'fannie_property_insurance_2026',
    'fannie_disaster_property_2025',
    'fannie_insured_loss_servicing_2023',
    'gao_homeowners_insurance_2026',
    'investor',
    'fannie_crt',
  ]) {
    assert.ok(mortgage_sources[source], source);
    assert.ok(concept.sources.includes(source), source);
  }
  for (const target of [
    'agency',
    'non_agency',
    'crt',
    'servicing',
    'default',
    'severity',
  ]) {
    assert.ok(
      concept.links.some((link) => link.id === target),
      target,
    );
    const edge = mortgage_relationships.find(
      (item) =>
        item.source === 'property_insurance_transmission' &&
        item.target === target,
    );
    assert.ok(edge, target);
    assert.ok(edge.sources?.length, target);
    assert.ok(edge.conditions?.length > 70, target);
  }
  const kinds = Object.fromEntries(
    mortgage_relationships
      .filter((edge) => edge.source === 'property_insurance_transmission')
      .map((edge) => [edge.target, edge.kind]),
  );
  assert.deepEqual(kinds, {
    agency: 'comparison',
    non_agency: 'comparison',
    crt: 'mechanism',
    servicing: 'mechanism',
    default: 'mechanism',
    severity: 'measurement',
  });
  assert.equal(learning_checks.property_insurance_transmission.correct, 0);
  assert.match(
    learning_checks.property_insurance_transmission.choices[0],
    /apply the relevant Agency, private-label or CRT contract/i,
  );
  assert.match(
    learning_checks.property_insurance_transmission.choices[1],
    /immediately creates mortgage default/i,
  );
  assert.equal(
    search_concepts('insurance non-renewal')[0]?.id,
    'property_insurance_transmission',
  );
});

test('spread relative value remains conditional on its model and window', () => {
  const matches = mortgage_concepts.filter((node) => node.id === 'spreads');
  assert.equal(matches.length, 1);
  const concept = matches[0];
  assert.match(concept.formula.expression, /eₜ = sₜ − ŝₜ/);
  assert.match(concept.formula.expression, /zₜ = eₜ/);
  for (const term of [
    'bp',
    'window',
    'frequency',
    'benchmark',
    'standardization',
  ])
    assert.match(concept.formula.assumptions, new RegExp(term, 'i'));
  assert.match(concept.formula.example, /z = \+2/);
  assert.match(concept.formula.example, /z = −1/);
  assert.match(concept.formula.example, /neither predicts convergence/i);
  assert.match(
    concept.question,
    /short-window “wide”.*long-window “tight”.*composite “neutral”/i,
  );
  assert.match(concept.distinction, /opposite signs without contradiction/i);
  assert.match(concept.distinction, /neutral label only means/i);
  assert.match(concept.distinction, /double-counted/i);
  for (const id of ['empirical_duration', 'model_risk', 'supply_demand'])
    assert.ok(
      concept.links.some((link) => link.id === id),
      id,
    );
  for (const source of [
    'fed_spreads',
    'tba_analytics_public',
    'convexity_feedback_public',
  ])
    assert.ok(concept.sources.includes(source), source);
  assert.equal(learning_checks.spreads.choices.length, 3);
  assert.equal(learning_checks.spreads.correct, 1);
  assert.match(
    learning_checks.spreads.choices[1],
    /align each model’s horizon, benchmark, factors, units and standardization/i,
  );
  assert.match(
    learning_checks.spreads.choices[1],
    /not a causal conclusion or forecast/i,
  );
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

test('special servicing separates servicer authority from changing control rights', () => {
  const concept = expansion_concepts.find(
    (node) => node.id === 'special_servicing',
  );
  assert.ok(concept);
  assert.match(concept.summary, /approval or direction rights/);
  assert.match(concept.distinction, /ultimate authority/);
  assert.match(concept.distinction, /Servicing Standard/);
  assert.match(concept.distinction, /Control Termination Event/);
  assert.match(concept.distinction, /non-binding consultation/);
  assert.match(concept.distinction, /Consultation Termination Event/);
  assert.match(concept.distinction, /transaction-specific/);
  assert.deepEqual(concept.sources, [
    'crefc_controlling_party',
    'crefc_psa_control',
    'benchmark_2026_v22_control',
  ]);
  assert.ok(!concept.sources.includes('crefc_s'));
  assert.equal(learning_checks.special_servicing.correct, 1);
  assert.match(
    learning_checks.special_servicing.choices[1],
    /Servicing Standard/,
  );
  assert.match(
    learning_checks.special_servicing.choices[1],
    /Consultation Termination Event/,
  );

  const modification_edge = expansion_relationships.find(
    (edge) =>
      edge.source === 'special_servicing' &&
      edge.target === 'loan_modification',
  );
  assert.ok(modification_edge);
  assert.ok(!modification_edge.sources.includes('crefc_s'));
  assert.match(modification_edge.reason, /Servicing Standard/);

  const path = expansion_paths.find(
    (model) => model.id === 'cre_workout_to_tranche',
  );
  assert.ok(path);
  assert.deepEqual(path.steps, [
    'refinance_risk',
    'extension_options',
    'special_servicing',
    'appraisal_reduction',
    'servicing_advances',
    'loan_modification',
    'collateral_tranche_cashflows',
  ]);
  assert.match(path.explanations[2], /Servicing Standard/);
  assert.match(path.explanations[2], /consultation termination events/);
  assert.match(
    path.boundary,
    /none of those events makes a workout action automatic/,
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

test('stipulated TBA narrows delivery without identifying a pool', () => {
  const concept = mortgage_concepts.find(
    (node) => node.id === 'stipulated_pool_trade',
  );
  assert.ok(concept);
  assert.equal(concept.topic, 'pool_selection');
  for (const query of ['stip', 'stips', 'stipulated TBA'])
    assert.equal(search_concepts(query)[0]?.id, 'stipulated_pool_trade', query);
  assert.match(
    concept.summary,
    /specific pools and CUSIPs are still identified later/,
  );
  assert.match(
    concept.distinction,
    /narrows the seller’s eligible delivery set/,
  );
  assert.match(
    concept.distinction,
    /analytics proxy is not a contractual stipulation/,
  );
  assert.deepEqual(
    concept.links.map((link) => link.id),
    ['tba', 'tba_allocation', 'specified', 'cheapest_deliverable', 'pay_up'],
  );
  for (const source of concept.sources) assert.ok(mortgage_sources[source]);
  for (const edge_id of [
    'tba__stipulated_pool_trade',
    'stipulated_pool_trade__tba_allocation',
    'stipulated_pool_trade__specified',
    'stipulated_pool_trade__cheapest_deliverable',
    'stipulated_pool_trade__pay_up',
  ])
    assert.ok(
      mortgage_relationships.some((edge) => edge.id === edge_id),
      edge_id,
    );
  assert.equal(learning_checks.stipulated_pool_trade.correct, 1);
  assert.match(
    learning_checks.stipulated_pool_trade.choices[1],
    /stip constrains later allocation/,
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
