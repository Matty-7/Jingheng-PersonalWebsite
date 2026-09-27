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
import {
  build_mortgage_graph,
  build_connection_graph,
  graph_bounds,
  fit_camera,
  zoom_camera,
  search_concepts,
} from '../lib/mortgage_graph.ts';

test('four-level hierarchy owns each concept once and never overlaps nodes at any depth', () => {
  const assigned = mortgage_topics.flatMap((t) => t.concepts);
  assert.equal(new Set(assigned).size, mortgage_concepts.length);
  assert.equal(assigned.length, mortgage_concepts.length);
  for (const concept of mortgage_concepts) {
    const topic = mortgage_topics.find((t) => t.id === concept.topic);
    assert.equal(topic?.branch, concept.branch);
    assert.ok(topic.concepts.includes(concept.id));
  }
  for (const filter of ['all', ...mortgage_branches.map((b) => b.id)]) {
    for (const depth of [0, 1, 2]) {
      const nodes = build_mortgage_graph(depth, filter);
      const ids = new Set(nodes.map((n) => n.id));
      assert.equal(ids.size, nodes.length);
      for (const node of nodes) {
        if (node.parent) assert.ok(ids.has(node.parent));
        const parents = new Set([node.id]);
        let parent = node.parent;
        while (parent) {
          assert.ok(!parents.has(parent));
          parents.add(parent);
          parent = nodes.find((n) => n.id === parent)?.parent;
        }
      }
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          assert.ok(
            Math.abs(a.x - b.x) >= (a.width + b.width) / 2 ||
              Math.abs(a.y - b.y) >= (a.height + b.height) / 2,
            `${filter}/${depth}: ${a.id} overlaps ${b.id}`,
          );
        }
    }
  }
  assert.equal(
    build_mortgage_graph(2).filter((n) => n.kind === 'concept').length,
    mortgage_concepts.length,
  );
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

test('connection studies expose every endpoint and keep cards apart', () => {
  for (const selected of mortgage_concepts) {
    const nodes = build_connection_graph(selected.id);
    const ids = new Set(nodes.map((n) => n.id));
    for (const edge of mortgage_relationships.filter(
      (e) => e.source === selected.id || e.target === selected.id,
    ))
      assert.ok(ids.has(edge.source) && ids.has(edge.target));
    assert.equal(ids.size, nodes.length);
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        assert.ok(
          Math.abs(nodes[i].x - nodes[j].x) >= 250 ||
            Math.abs(nodes[i].y - nodes[j].y) >= 80,
        );
      }
  }
});

test('search prioritizes exact terms and camera math preserves the zoom anchor', () => {
  assert.equal(search_concepts('  OAS ')[0].id, 'oas');
  assert.equal(search_concepts('weighted average loan age')[0].id, 'wala');
  assert.equal(search_concepts('no matching mortgage phrase').length, 0);
  assert.equal(search_concepts('').length, 0);
  const camera = { x: 150, y: 240, scale: 0.6 };
  const zoomed = zoom_camera(camera, 1.25, 430, 320);
  assert.ok(
    Math.abs(
      (430 - camera.x) / camera.scale - (430 - zoomed.x) / zoomed.scale,
    ) < 1e-9,
  );
  assert.ok(
    Math.abs(
      (320 - camera.y) / camera.scale - (320 - zoomed.y) / zoomed.scale,
    ) < 1e-9,
  );
  assert.equal(zoom_camera(camera, 100, 0, 0).scale, 2);
  assert.equal(zoom_camera(camera, 0.001, 0, 0).scale, 0.07);
  for (const [width, height] of [
    [1200, 650],
    [356, 440],
  ]) {
    const bounds = graph_bounds(build_mortgage_graph(2));
    const fit = fit_camera(bounds, width, height);
    assert.ok(bounds.width * fit.scale <= width);
    assert.ok(bounds.height * fit.scale <= height);
  }
});

import { atlas_comparisons } from '../content/atlas_extensions.ts';
import { render_mortgage_math, mortgage_math } from '../lib/mortgage_math.ts';
import {
  study_edges,
  connection_lanes,
  connection_route,
} from '../lib/mortgage_graph.ts';
import {
  mechanism_models,
  mechanism_concepts,
} from '../content/mortgage_mechanisms.ts';
import {
  visit_concept,
  read_concept_hash,
  concept_hash,
} from '../lib/mortgage_reading.ts';

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

test('reading history branches correctly, stays bounded and accepts only known concept links', () => {
  let trail = { ids: [], cursor: -1 };
  trail = visit_concept(trail, 'oas');
  trail = visit_concept(trail, 'z_spread');
  assert.deepEqual(visit_concept(trail, 'z_spread'), trail);
  trail = { ...trail, cursor: 0 };
  trail = visit_concept(trail, 'duration');
  assert.deepEqual(trail, { ids: ['oas', 'duration'], cursor: 1 });
  for (let i = 0; i < 80; i++) trail = visit_concept(trail, `concept_${i}`);
  assert.equal(trail.ids.length, 60);
  assert.equal(trail.cursor, 59);
  const valid = new Set(['oas', 'rate_lock']);
  assert.equal(
    read_concept_hash(concept_hash('rate_lock'), valid),
    'rate_lock',
  );
  for (const hash of [
    '',
    '#concept=missing',
    '#concept=%3Cscript%3E',
    '#unrelated',
  ])
    assert.equal(read_concept_hash(hash, valid), null);
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

test('each connection study has one line per neighbor and label lanes clear every card', () => {
  for (const c of mortgage_concepts) {
    const nodes = build_connection_graph(c.id),
      index = new Map(nodes.map((n) => [n.id, n]));
    const edges = connection_lanes(c.id);
    const neighbors = edges.map((e) =>
      e.source === c.id ? e.target : e.source,
    );
    assert.equal(new Set(neighbors).size, neighbors.length, c.id);
    const labels = [];
    for (const e of edges) {
      const route = connection_route(index.get(e.source), index.get(e.target));
      assert.ok(!/NaN|undefined/.test(route.path));
      for (const node of nodes)
        assert.ok(
          Math.abs(route.x - node.x) >= 108 + node.width / 2 ||
            Math.abs(route.y - node.y) >= 12 + node.height / 2,
          `${c.id}: ${e.id} label intersects ${node.id}`,
        );
      for (const other of labels)
        assert.ok(
          Math.abs(route.x - other.x) >= 216 ||
            Math.abs(route.y - other.y) >= 24,
          `${c.id} label collision`,
        );
      labels.push(route);
    }
  }
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

test('every concept participates in the analytical network with complete study explanations', () => {
  for (const c of mortgage_concepts) {
    const expected = mortgage_relationships.filter(
      (e) => e.source === c.id || e.target === c.id,
    );
    assert.ok(expected.length > 0, `${c.id}: no analytical relationship`);
    assert.deepEqual(
      study_edges(c.id)
        .map((e) => e.id)
        .sort(),
      expected.map((e) => e.id).sort(),
    );
    assert.deepEqual(
      connection_lanes(c.id)
        .flatMap((lane) => lane.relationships.map((e) => e.id))
        .sort(),
      expected.map((e) => e.id).sort(),
    );
  }
  const basis = connection_lanes('basis_risk').find((lane) =>
    lane.relationships.some((e) => e.source === 'spread_duration'),
  );
  assert.ok(
    basis.relationships.length > 1,
    'measurement and comparison must both survive',
  );
  assert.equal(
    basis.directed,
    false,
    'a mixed relationship lane must not imply one causal arrow',
  );
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
