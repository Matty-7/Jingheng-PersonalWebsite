import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  analytics_sources,
  analytics_paths,
  analytics_concepts,
} from '../content/mortgage_analytics.ts';
import { learning_checks } from '../content/mortgage_checks.ts';
import { mortgage_paths } from '../content/mortgage_concepts.ts';
import {
  valuation_paths,
  valuation_relationships,
} from '../content/mortgage_valuation.ts';
import { search_concepts } from '../lib/mortgage_search.ts';

test('analytics paths preserve complete explanations and explicit boundaries', () => {
  for (const path of analytics_paths) {
    assert.ok(mortgage_paths.includes(path));
    assert.equal(path.steps.length, path.explanations.length, path.id);
    assert.ok(
      path.explanations.every((text) => text.trim().length > 0),
      path.id,
    );
    assert.ok(path.boundary.length > 65 && path.premise.length > 35, path.id);
  }
  assert.ok(
    analytics_concepts.every(
      (node) => node.sources.length && node.links.length >= 2,
    ),
  );
});

test('operational acronyms resolve to the intended financial concept', () => {
  for (const [query, id] of [
    ['MDR', 'conditional_default_rate'],
    ['CDR', 'conditional_default_rate'],
    ['MPR', 'monthly_payment_rate'],
    ['ABS speed', 'absolute_prepayment_rate'],
    ['projection anchor', 'projection_anchor'],
    ['normal volatility', 'volatility_conventions'],
  ])
    assert.equal(search_concepts(query)[0]?.id, id, query);
});

test('volatility-to-OAS path preserves the comparison contract and state dependence', () => {
  const path = valuation_paths.find(
    (candidate) => candidate.id === 'volatility_state_to_oas',
  );
  assert.ok(path);
  assert.deepEqual(path.steps, [
    'volatility_conventions',
    'volatility_surface',
    'model_calibration',
    'short_rate_model',
    'volatility',
    'coupon_stack',
    'incentive',
    'prepayments',
    'path_cashflows',
    'pathwise_valuation',
    'oas',
  ]);
  assert.equal(path.steps.length, path.explanations.length);
  for (const term of [
    'full price',
    'as-of',
    'settlement',
    'curve',
    'collateral',
    'prepayment specification',
    'OAS convention',
    'recalibrated',
  ])
    assert.match(path.premise, new RegExp(term, 'i'));
  assert.match(path.explanations.join(' '), /far out-of-the-money/i);
  assert.match(path.explanations.join(' '), /nearer the money/i);
  assert.match(path.boundary, /no universal sign or magnitude/i);
  assert.match(path.boundary, /Observed spread co-movement/i);
  assert.match(path.boundary, /neither a forecast nor a pricing tool/i);

  const relationshipPairs = new Set(
    valuation_relationships.map(
      (relationship) => `${relationship.source}->${relationship.target}`,
    ),
  );
  for (const pair of [
    'volatility_conventions->volatility_surface',
    'short_rate_model->volatility',
    'volatility->coupon_stack',
    'prepayments->path_cashflows',
  ])
    assert.ok(relationshipPairs.has(pair), pair);

  const volatility = search_concepts('rate volatility')[0];
  assert.equal(volatility?.id, 'volatility');
  assert.match(
    volatility.formula?.assumptions ?? '',
    /same observed full price/i,
  );
  assert.match(volatility.formula?.assumptions ?? '', /recalibrated/i);
  assert.match(volatility.formula?.example ?? '', /far out of the money/i);
  assert.match(volatility.formula?.example ?? '', /near-the-money/i);
  assert.match(volatility.distinction, /universal OAS direction or magnitude/i);
  assert.match(volatility.distinction, /not a pure volatility sensitivity/i);
  for (const id of [
    'volatility_conventions',
    'volatility_surface',
    'model_calibration',
    'coupon_stack',
    'path_cashflows',
    'oas',
  ])
    assert.ok(
      volatility.links.some((link) => link.id === id),
      id,
    );
});

test('effective convexity explains sign without treating it as a permanent label', () => {
  const concept = analytics_concepts.find(
    (node) => node.id === 'effective_convexity',
  );
  assert.ok(concept);
  assert.match(concept.summary, /P₋ \+ P₊ exceeds 2P₀/);
  assert.match(concept.distinction, /Low CPR.*alone does not prove/);
  assert.match(concept.formula?.assumptions ?? '', /P₀ > 0/);
  assert.match(concept.formula?.example ?? '', /C_eff ≈ \+10 years²/);
  assert.match(concept.formula?.example ?? '', /up-shock price still falls/);
  assert.ok(concept.links.some((link) => link.id === 'convexity'));
});

test('empirical duration states its regression convention and sample-dependent boundary', () => {
  const matches = analytics_concepts.filter(
    (node) => node.id === 'empirical_duration',
  );
  assert.equal(matches.length, 1);
  const concept = matches[0];
  assert.equal(
    search_concepts('regression-based duration')[0]?.id,
    'empirical_duration',
  );
  assert.match(concept.formula?.expression ?? '', /D_emp = −β/);
  for (const term of [
    'proportional full-price change',
    'total return',
    'decimal units',
    'window',
    'frequency',
    'benchmark',
  ])
    assert.match(concept.formula?.assumptions ?? '', new RegExp(term, 'i'));
  for (const term of [
    'Effective duration',
    'spread',
    'liquidity',
    'outliers',
    'regime',
    'neither a forecast nor intrinsically more real',
  ])
    assert.match(concept.distinction, new RegExp(term, 'i'));
  assert.deepEqual(
    new Set(concept.links.map((link) => link.id)),
    new Set(['duration', 'hedging', 'basis_risk', 'model_risk', 'oas']),
  );
  assert.ok(concept.sources.includes('frbsf_empirical_duration'));
  assert.equal(
    analytics_sources.frbsf_empirical_duration.publisher,
    'Federal Reserve Bank of San Francisco',
  );
  assert.equal(learning_checks.empirical_duration.correct, 1);
  assert.ok(
    analytics_paths.every((path) => !path.steps.includes('empirical_duration')),
  );
});

test('subordination compares path-dependent dollar and percentage support', () => {
  const concept = search_concepts('subordination')[0];
  assert.equal(concept?.id, 'subordination');
  assert.match(concept.summary, /reporting date/);
  assert.match(concept.summary, /protected class/);
  assert.match(concept.distinction, /\$94 million senior/);
  assert.match(concept.distinction, /about 6\.67% support on \$90 million/);
  assert.match(
    concept.distinction,
    /about 2\.22% support on the same \$90 million/,
  );
  assert.match(concept.distinction, /not universal RMBS or CRT rules/);
  assert.equal(concept.formula?.expression, 'Supportₜ = Jₜ ÷ (Pₜ + Jₜ)');
  assert.match(concept.formula?.assumptions ?? '', /two-class snapshot only/i);
  assert.match(concept.formula?.assumptions ?? '', /different denominator/);
  assert.match(
    concept.formula?.example ?? '',
    /ending total is \$90m in both paths/,
  );
  assert.match(concept.answer, /first-dollar principal-loss threshold/);
  assert.match(concept.answer, /default path/);
  assert.match(concept.answer, /not a price, yield, IRR breakeven or forecast/);
  assert.ok(concept.links.some((link) => link.id === 'recovery_lag'));
  assert.equal(learning_checks.subordination.correct, 0);
  assert.match(
    learning_checks.subordination.choices[0],
    /consumed \$4 million/,
  );
  assert.equal(6 / (84 + 6), 0.06666666666666667);
  assert.equal(2 / (88 + 2), 0.022222222222222223);
});
