import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  analytics_sources,
  analytics_paths,
  analytics_concepts,
} from '../content/mortgage_analytics.ts';
import { learning_checks } from '../content/mortgage_checks.ts';
import { mortgage_paths } from '../content/mortgage_concepts.ts';
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
