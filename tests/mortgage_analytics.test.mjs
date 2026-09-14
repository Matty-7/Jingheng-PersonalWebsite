import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analytics_paths, analytics_concepts } from '../content/mortgage_analytics.ts';
import { mortgage_paths } from '../content/mortgage_concepts.ts';
import { search_concepts } from '../lib/mortgage_graph.ts';

test('analytics paths preserve complete explanations and explicit boundaries', () => {
  for (const path of analytics_paths) {
    assert.ok(mortgage_paths.includes(path));
    assert.equal(path.steps.length, path.explanations.length, path.id);
    assert.ok(path.explanations.every((text) => text.trim().length > 0), path.id);
    assert.ok(path.boundary.length > 65 && path.premise.length > 35, path.id);
  }
  assert.ok(analytics_concepts.every((node) => node.sources.length && node.links.length >= 2));
});

test('operational acronyms resolve to the intended financial concept', () => {
  for (const [query, id] of [
    ['MDR', 'conditional_default_rate'], ['CDR', 'conditional_default_rate'],
    ['MPR', 'monthly_payment_rate'], ['ABS speed', 'absolute_prepayment_rate'],
    ['projection anchor', 'projection_anchor'], ['normal volatility', 'volatility_conventions'],
  ]) assert.equal(search_concepts(query)[0]?.id, id, query);
});
