import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  mortgage_branches,
  mortgage_concepts,
  mortgage_sources,
  learning_path,
} from '../content/mortgage_concepts.ts';

test('every learning node has a unique identity, a visible branch and complete reading links', () => {
  const ids = new Set(mortgage_concepts.map((node) => node.id));
  const branches = new Set(mortgage_branches.map((branch) => branch.id));
  assert.equal(ids.size, mortgage_concepts.length);
  assert.equal(branches.size, mortgage_branches.length);
  assert.ok(mortgage_concepts.length >= 30);
  for (const branch of branches)
    assert.ok(mortgage_concepts.some((node) => node.branch === branch));
  for (const node of mortgage_concepts) {
    assert.match(node.id, /^[a-z][a-z0-9_]*$/);
    assert.ok(branches.has(node.branch), node.id);
    assert.ok(
      node.summary && node.distinction && node.question && node.answer,
      node.id,
    );
    assert.ok(node.links.length && node.sources.length, node.id);
    assert.equal(
      new Set(node.links.map((link) => link.id)).size,
      node.links.length,
    );
    for (const link of node.links) {
      assert.ok(
        ids.has(link.id) && link.id !== node.id,
        `${node.id} → ${link.id}`,
      );
      assert.ok(
        link.reason.length > 10,
        `${node.id} needs a relationship, not a bare tag`,
      );
    }
    for (const id of node.sources) {
      const source = mortgage_sources[id];
      assert.ok(source?.publisher && source.title, `${node.id}: ${id}`);
      assert.equal(new URL(source.url).protocol, 'https:');
    }
    if (node.formula)
      assert.ok(node.formula.expression && node.formula.assumptions);
  }
  for (const step of learning_path) assert.ok(ids.has(step.id));
});

test('repo separates settlement agency from central clearing and preserves the MBS funding boundary', () => {
  const repo = mortgage_concepts.find((concept) => concept.id === 'repo');
  assert.match(repo.summary, /tri-party agent/i);
  assert.match(repo.summary, /without becoming.*central counterparty/i);
  assert.match(repo.distinction, /default-fund/);
  assert.match(
    repo.distinction,
    /SOFR.*not the position-specific funding cost/i,
  );
  assert.deepEqual(repo.sources, [
    'repo_public',
    'repo_participants_public',
    'repo_microstructure_public',
  ]);
});

test('the knowledge graph has no disconnected cluster, including cross-branch learning connections', () => {
  const seen = new Set();
  const pending = [mortgage_concepts[0].id];
  while (pending.length) {
    const id = pending.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    const node = mortgage_concepts.find((item) => item.id === id);
    pending.push(...node.links.map((link) => link.id));
    pending.push(
      ...mortgage_concepts
        .filter((item) => item.links.some((link) => link.id === id))
        .map((item) => item.id),
    );
  }
  assert.equal(seen.size, mortgage_concepts.length);
  for (const branch of mortgage_branches) {
    assert.ok(
      mortgage_concepts.some(
        (node) =>
          node.branch === branch.id &&
          node.links.some(
            (link) =>
              mortgage_concepts.find((target) => target.id === link.id)
                .branch !== branch.id,
          ),
      ),
      `${branch.id} must connect to the wider subject`,
    );
  }
});

function analytical_components(edges) {
  const adjacency = new Map(mortgage_concepts.map((node) => [node.id, []]));
  for (const edge of edges) {
    adjacency.get(edge.source).push(edge.target);
    adjacency.get(edge.target).push(edge.source);
  }
  const unseen = new Set(adjacency.keys());
  const components = [];
  while (unseen.size) {
    const stack = [unseen.values().next().value];
    const component = [];
    while (stack.length) {
      const id = stack.pop();
      if (!unseen.delete(id)) continue;
      component.push(id);
      stack.push(...adjacency.get(id));
    }
    components.push(component);
  }
  return components;
}

test('the actual analytical relation network is one component, not just nodes with neighbors', () => {
  const components = analytical_components(mortgage_relationships);
  assert.equal(components.length, 1, JSON.stringify(components));
  assert.equal(components[0].length, mortgage_concepts.length);
  // The historical SMM/CPR island still has edges after removing its bridges.
  // A degree-only check would pass; this traversal must detect its isolation.
  const island = new Set(['smm', 'cpr']);
  const severed = mortgage_relationships.filter(
    (edge) => island.has(edge.source) === island.has(edge.target),
  );
  for (const id of island)
    assert.ok(severed.some((edge) => edge.source === id || edge.target === id));
  const split = analytical_components(severed);
  assert.ok(
    split.length > 1,
    'Removing the bridges must break analytical connectivity',
  );
  assert.deepEqual(split.find((group) => group.includes('smm')).sort(), [
    'cpr',
    'smm',
  ]);
});

import {
  mortgage_topics,
  mortgage_relationships,
  mortgage_paths,
  mortgage_path_models,
} from '../content/mortgage_concepts.ts';
import { search_concepts } from '../lib/mortgage_search.ts';

test('every concept belongs to exactly one topic in its domain', () => {
  const assigned = mortgage_topics.flatMap((t) => t.concepts);
  assert.equal(new Set(assigned).size, mortgage_concepts.length);
  assert.equal(assigned.length, mortgage_concepts.length);
  for (const concept of mortgage_concepts) {
    const topic = mortgage_topics.find((t) => t.id === concept.topic);
    assert.equal(topic?.branch, concept.branch);
    assert.ok(topic.concepts.includes(concept.id));
  }
});

test('analytical edges are explicit, typed and connected across every domain', () => {
  const index = new Map(mortgage_concepts.map((n) => [n.id, n]));
  assert.equal(
    new Set(mortgage_relationships.map((e) => e.id)).size,
    mortgage_relationships.length,
  );
  for (const edge of mortgage_relationships) {
    assert.ok(index.has(edge.source) && index.has(edge.target));
    assert.notEqual(edge.source, edge.target);
    assert.ok(edge.label && edge.reason.length > 30);
    assert.ok(
      ['mechanism', 'definition', 'measurement', 'comparison'].includes(
        edge.kind,
      ),
    );
  }
  const cross = mortgage_relationships.filter(
    (e) => index.get(e.source).branch !== index.get(e.target).branch,
  );
  assert.ok(cross.length >= 24);
  for (const branch of mortgage_branches)
    assert.ok(
      cross.some(
        (e) =>
          index.get(e.source).branch === branch.id ||
          index.get(e.target).branch === branch.id,
      ),
    );
  for (const path of mortgage_paths) {
    assert.ok(path.steps.length >= 4);
    for (let i = 1; i < path.steps.length; i++)
      assert.ok(
        mortgage_relationships.some(
          (e) =>
            (e.source === path.steps[i - 1] && e.target === path.steps[i]) ||
            (e.target === path.steps[i - 1] && e.source === path.steps[i]),
        ),
        `${path.id}: missing explanation for ${path.steps[i - 1]} / ${path.steps[i]}`,
      );
  }
});

test('search prioritizes exact terms and rejects empty or unmatched queries', () => {
  assert.equal(search_concepts('  OAS ')[0].id, 'oas');
  assert.equal(search_concepts('weighted average loan age')[0].id, 'wala');
  assert.equal(search_concepts('no matching mortgage phrase').length, 0);
  assert.equal(search_concepts('').length, 0);
});

import { atlas_comparisons } from '../content/atlas_extensions.ts';
import { render_mortgage_math, mortgage_math } from '../lib/mortgage_math.ts';

import {
  mechanism_models,
  mechanism_concepts,
} from '../content/mortgage_mechanisms.ts';

test('mechanism paths explain every step and state their limits', () => {
  const ids = new Set(mortgage_concepts.map((c) => c.id));
  for (const model of mechanism_models) {
    assert.equal(model.steps.length, model.explanations.length, model.id);
    assert.ok(
      model.premise.length > 35 && model.boundary.length > 65,
      model.id,
    );
    assert.ok(
      model.explanations.every((s) => s.length > 45),
      model.id,
    );
    assert.ok(
      model.steps.every((id) => ids.has(id)),
      model.id,
    );
  }
  for (const node of mechanism_concepts) assert.ok(node.links.length >= 2);
  assert.match(
    mechanism_concepts.find((c) => c.id === 'expected_loss').formula
      .assumptions,
    /loan-level/,
  );
  assert.match(
    mechanism_models.find((c) => c.id === 'income_to_real_return').premise,
    /not successive causes/,
  );
});

test('mortgage lock-in states its units and follows principal timing into rate risk', () => {
  const lock_in = mortgage_concepts.find((c) => c.id === 'lock_in');
  assert.match(lock_in.formula.expression, /new-loan rate/);
  assert.match(lock_in.formula.assumptions, /not a payment change/);
  assert.match(lock_in.formula.example, /\+400 bp/);
  assert.match(lock_in.distinction, /not a prohibition/);
  assert.deepEqual(
    mortgage_path_models.find((model) => model.id === 'lock_in_to_duration')
      .steps,
    ['lock_in', 'turnover', 'prepayments', 'cash_flows', 'wal', 'duration'],
  );
  const comparison = mortgage_relationships.find(
    (edge) => edge.id === 'wal__duration',
  );
  assert.equal(comparison.kind, 'comparison');
  assert.match(comparison.conditions, /does not mechanically imply/);
  assert.match(mortgage_math.lock_in.variables, /basis points/);
});

test('total return separates the cash bucket from benchmark excess return and OAS', () => {
  const total_return = mortgage_concepts.find((c) => c.id === 'total_return');
  assert.match(
    total_return.formula.expression,
    /ending value of cash received/,
  );
  assert.match(total_return.formula.assumptions, /no overlap/);
  assert.match(total_return.formula.assumptions, /not an annualized rate/);
  assert.match(total_return.formula.example, /−1 percentage point \(−100 bp\)/);
  assert.match(total_return.distinction, /not OAS/);
  assert.match(total_return.distinction, /actual hedge P&L/);
  assert.deepEqual(
    total_return.links.slice(-2).map((link) => link.id),
    ['benchmark_matching', 'oas'],
  );
  assert.ok(total_return.sources.includes('bloomberg_returns_public'));
  assert.match(mortgage_math.total_return.variables, /do not overlap/);
});

test('specified-pool pay-up states quotation units, comparability and extension limits', () => {
  const pay_up = mortgage_concepts.find((c) => c.id === 'pay_up');
  assert.match(pay_up.formula.expression, /P_spec − P_TBA/);
  assert.match(
    pay_up.formula.assumptions,
    /clean-price points per \$100 current face/,
  );
  assert.match(pay_up.formula.assumptions, /same quotation time/);
  assert.match(pay_up.formula.assumptions, /same settlement date/);
  assert.match(pay_up.formula.assumptions, /fungible delivery class/);
  assert.match(pay_up.formula.example, /\$0\.50 per \$100 current face/);
  assert.match(
    pay_up.formula.example,
    /not a 0\.5% realized return or 50 bp of yield/,
  );
  assert.match(
    pay_up.distinction,
    /Slower principal is not universally better/,
  );
  assert.match(pay_up.answer, /worsen extension of a low-coupon position/);
  assert.deepEqual(
    pay_up.links.slice(-2).map((link) => link.id),
    ['price', 'extension'],
  );
  assert.deepEqual(pay_up.sources, [
    'tba',
    'specified_pool_pricing',
    'fannie_mbs_basics',
  ]);
  assert.match(
    mortgage_math.pay_up.variables,
    /Not a yield spread or realized return/,
  );
});

test('hybrid ARM separates the fully indexed reference from the capped reset', () => {
  const arm = mortgage_concepts.find((c) => c.id === 'fixed_arm');
  assert.match(arm.summary, /5\/1 ARM.*five-year.*annual resets/);
  assert.match(arm.formula.expression, /index observation \+ margin/);
  assert.match(
    arm.formula.assumptions,
    /not necessarily the actual reset rate/,
  );
  assert.match(arm.formula.example, /6% fully indexed rate/);
  assert.match(arm.formula.example, /first reset to at most 5%/);
  assert.match(arm.distinction, /initial cap/);
  assert.match(arm.distinction, /percentage points/);
  assert.deepEqual(
    arm.links.slice(-2).map((link) => link.id),
    ['caps_floors', 'reset_payment_dates'],
  );
  assert.deepEqual(arm.sources, ['arm', 'arm_charm', 'arm_caps']);
  assert.match(mortgage_math.fixed_arm.variables, /annual rates/);
});

test('all displayed formulas render strict TeX with accessible MathML and variable definitions', () => {
  const rendered = render_mortgage_math();
  for (const c of mortgage_concepts.filter((c) => c.formula)) {
    assert.ok(mortgage_math[c.id].variables.length > 25, c.id);
    assert.match(rendered[c.id].html, /<math /, c.id);
    assert.match(
      rendered[c.id].html,
      /<annotation encoding="application\/x-tex">/,
      c.id,
    );
    assert.doesNotMatch(rendered[c.id].html, /katex-error/, c.id);
  }
  assert.match(rendered.pv.html, /mfrac/);
  assert.match(rendered.cpr.html, /msup/);
  assert.match(rendered.duration.html, /mfrac/);
  assert.match(rendered.oas.html, /mathbb/);
  assert.ok(Math.abs((1 - (1 - 0.06) ** (1 / 12)) * 100 - 0.5143) < 0.0001);
  assert.equal((100.4 - 99.6) / (2 * 100 * 0.001), 4.000000000000057);
});

test('comparison rows are complete, navigable, and cover the important independent dimensions', () => {
  const ids = new Set(mortgage_concepts.map((c) => c.id));
  for (const set of atlas_comparisons) {
    assert.equal(new Set(set.rows.map((r) => r.id)).size, set.rows.length);
    for (const row of set.rows) {
      assert.ok(ids.has(row.id));
      assert.equal(row.cells.length, set.columns.length);
      assert.ok(row.cells.every(Boolean));
    }
  }
  for (const id of [
    'g_spread',
    'i_spread',
    'z_spread',
    'oas',
    'asset_swap',
    'discount_margin',
    'quoted_margin',
  ])
    assert.ok(atlas_comparisons[0].rows.some((r) => r.id === id));
  for (const id of ['rmbs', 'cmbs', 'abs', 'clo', 'crt', 'covered_bonds'])
    assert.equal(search_concepts(id)[0].id, id);
  assert.match(
    atlas_comparisons
      .find((c) => c.id === 'currencies')
      .rows.find((r) => r.id === 'cny_rates')
      .cells.join(' '),
    /seven-day/,
  );
});

// Homepage destinations must survive future catalog changes.
test('homepage domain entrances and spread filters stay complete and resolve to readers', async () => {
  const { mortgage_domains, mortgage_preview_path } =
    await import('../content/mortgage_domains.ts');
  const { spread_groups } = await import('../content/mortgage_spreads.ts');
  const { atlas_comparisons } = await import('../content/atlas_extensions.ts');
  const catalog = new Map(mortgage_concepts.map((c) => [c.id, c]));
  assert.equal(mortgage_domains.length, mortgage_branches.length);
  for (const domain of mortgage_domains)
    assert.equal(catalog.get(domain.entry)?.branch, domain.id);
  for (const step of mortgage_preview_path) assert.ok(catalog.has(step.id));
  const measures = atlas_comparisons
    .find((c) => c.id === 'spreads')
    .rows.map((r) => r.id);
  const grouped = spread_groups
    .filter((g) => g.id !== 'all')
    .flatMap((g) => g.concepts);
  assert.deepEqual([...grouped].sort(), [...measures].sort());
  assert.equal(new Set(grouped).size, grouped.length);
});

test('every concept participates in the analytical network', () => {
  for (const concept of mortgage_concepts) {
    assert.ok(
      mortgage_relationships.some(
        (edge) => edge.source === concept.id || edge.target === concept.id,
      ),
      `${concept.id}: no analytical relationship`,
    );
  }
});

test('runoff and structured cash-flow links retain direction, conditions and public references', async () => {
  const { foundational_relationships } =
    await import('../content/mortgage_relationships.ts');
  for (const edge of foundational_relationships) {
    assert.ok(edge.conditions && edge.sources.length);
    for (const id of edge.sources)
      assert.ok(mortgage_sources[id], `${edge.id}: missing source ${id}`);
  }
  const runoff = mortgage_relationships.find(
    (e) => e.source === 'prepayments' && e.target === 'qe_qt',
  );
  assert.ok(runoff?.conditions.includes('reinvestment'));
  assert.equal(
    mortgage_relationships.some(
      (e) => e.source === 'qe_qt' && e.target === 'prepayments',
    ),
    false,
  );
  for (const [source, target, kind] of [
    ['prepayments', 'io_po', 'mechanism'],
    ['spot_curve', 'forward_curve', 'measurement'],
    ['cmo', 'remic', 'comparison'],
  ])
    assert.ok(
      mortgage_relationships.some(
        (e) => e.source === source && e.target === target && e.kind === kind,
      ),
    );
});

test('coupon stack connects coupon, borrower behavior and conditional hedge adjustment', () => {
  const concept = mortgage_concepts.find((item) => item.id === 'coupon_stack');
  assert.ok(concept);
  assert.match(concept.summary, /Security coupon.*not.*borrower WAC/i);
  assert.match(concept.distinction, /not a forecast/i);
  assert.equal(search_concepts('coupon stack')[0].id, 'coupon_stack');
  assert.equal(search_concepts('convexity hedging')[0].id, 'coupon_stack');
  for (const [source, target, kind] of [
    ['net_coupon', 'coupon_stack', 'definition'],
    ['current_coupon', 'coupon_stack', 'comparison'],
    ['incentive', 'coupon_stack', 'mechanism'],
    ['coupon_stack', 'hedging', 'mechanism'],
  ]) {
    const edge = mortgage_relationships.find(
      (item) =>
        item.source === source && item.target === target && item.kind === kind,
    );
    assert.ok(edge, `${source} -> ${target}`);
    assert.ok(edge.conditions, `${edge.id}: missing conditions`);
    assert.ok(edge.sources?.length, `${edge.id}: missing sources`);
  }
});
