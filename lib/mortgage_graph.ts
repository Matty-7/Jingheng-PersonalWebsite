import {
  mortgage_branches,
  mortgage_topics,
  mortgage_concepts,
  mortgage_relationships,
} from '../content/mortgage_concepts.ts';

export type GraphNode = {
  id: string;
  kind: 'root' | 'branch' | 'topic' | 'concept';
  title: string;
  subtitle: string;
  branch?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parent?: string;
};
export type Camera = { x: number; y: number; scale: number };
export type GraphBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export const concept_index = new Map(
  mortgage_concepts.map((node) => [node.id, node]),
);
export const topic_index = new Map(
  mortgage_topics.map((topic) => [topic.id, topic]),
);

// Deterministic layout. The parent's allocated vertical span includes every child.
// Nothing depends on browser font metrics, timers or a force simulation.
export function build_mortgage_graph(
  depth: number,
  branch_filter = 'all',
  topic_filter = 'all',
): GraphNode[] {
  const nodes: GraphNode[] = [
    {
      id: 'mortgages',
      kind: 'root',
      title: 'Mortgage Map',
      subtitle: 'Loans → cash flows → decisions',
      x: 0,
      y: 0,
      width: 250,
      height: 102,
    },
  ];
  const branches = mortgage_branches.filter(
    (b) => branch_filter === 'all' || b.id === branch_filter,
  );
  const topic_span = (id: string) =>
    depth >= 2 ? (topic_index.get(id)?.concepts.length ?? 0) * 84 + 26 : 114;
  const branch_span = (id: string) =>
    depth === 0
      ? 160
      : mortgage_topics
          .filter(
            (t) =>
              t.branch === id &&
              (topic_filter === 'all' || t.id === topic_filter),
          )
          .reduce((sum, t) => sum + topic_span(t.id), 0) + 100;
  for (const side of [-1, 1]) {
    const side_branches = branches.filter((b) =>
      branch_filter !== 'all'
        ? side === 1
        : (mortgage_branches.indexOf(b) <
          Math.ceil(mortgage_branches.length / 2)
            ? -1
            : 1) === side,
    );
    let cursor =
      -side_branches.reduce((sum, b) => sum + branch_span(b.id), 0) / 2;
    for (const branch of side_branches) {
      const span = branch_span(branch.id);
      const center = cursor + span / 2;
      const topics = mortgage_topics.filter(
        (t) =>
          t.branch === branch.id &&
          (topic_filter === 'all' || t.id === topic_filter),
      );
      nodes.push({
        id: branch.id,
        kind: 'branch',
        title: branch.title,
        subtitle: branch.question,
        branch: branch.id,
        x: side * (branch_filter === 'all' ? 440 : 300),
        y: center,
        width: 250,
        height: 116,
        parent: 'mortgages',
      });
      let topic_cursor = cursor + 50;
      if (depth > 0)
        for (const topic of topics) {
          const height = topic_span(topic.id);
          nodes.push({
            id: topic.id,
            kind: 'topic',
            title: topic.title,
            subtitle: `${topic.concepts.length} concepts`,
            branch: branch.id,
            x: side * (branch_filter === 'all' ? 800 : 580),
            y: topic_cursor + height / 2,
            width: 240,
            height: 76,
            parent: branch.id,
          });
          if (depth > 1)
            topic.concepts.forEach((id, index) => {
              const node = concept_index.get(id)!;
              nodes.push({
                id,
                kind: 'concept',
                title: node.title,
                subtitle: node.subtitle,
                branch: branch.id,
                x: side * (branch_filter === 'all' ? 1140 : 865),
                y: topic_cursor + 42 + index * 84,
                width: 248,
                height: 68,
                parent: topic.id,
              });
            });
          topic_cursor += height;
        }
      cursor += span;
    }
  }
  return nodes;
}

export function build_connection_graph(selected: string): GraphNode[] {
  const center = concept_index.get(selected);
  if (!center) return [];
  const edges = mortgage_relationships.filter(
    (e) => e.source === selected || e.target === selected,
  );
  const incoming = [
    ...new Set(edges.filter((e) => e.target === selected).map((e) => e.source)),
  ];
  const outgoing = [
    ...new Set(edges.filter((e) => e.source === selected).map((e) => e.target)),
  ].filter((id) => !incoming.includes(id));
  const node = (id: string, x: number, y: number): GraphNode => {
    const c = concept_index.get(id)!;
    return {
      id,
      kind: 'concept',
      title: c.title,
      subtitle: c.subtitle,
      branch: c.branch,
      x,
      y,
      width: 250,
      height: 80,
    };
  };
  return [
    node(selected, 0, 0),
    ...incoming.map((id, i) =>
      node(id, -620, (i - (incoming.length - 1) / 2) * 130),
    ),
    ...outgoing.map((id, i) =>
      node(id, 620, (i - (outgoing.length - 1) / 2) * 130),
    ),
  ];
}

export function graph_bounds(nodes: GraphNode[]): GraphBounds {
  if (!nodes.length) return { x: -200, y: -100, width: 400, height: 200 };
  const left = Math.min(...nodes.map((n) => n.x - n.width / 2)) - 46;
  const top = Math.min(...nodes.map((n) => n.y - n.height / 2)) - 46;
  return {
    x: left,
    y: top,
    width: Math.max(...nodes.map((n) => n.x + n.width / 2)) + 46 - left,
    height: Math.max(...nodes.map((n) => n.y + n.height / 2)) + 46 - top,
  };
}

export function fit_camera(
  bounds: GraphBounds,
  width: number,
  height: number,
): Camera {
  const scale = Math.min(
    1.1,
    Math.max(
      0.02,
      Math.min((width - 36) / bounds.width, (height - 64) / bounds.height),
    ),
  );
  return {
    x: width / 2 - (bounds.x + bounds.width / 2) * scale,
    y: height / 2 - (bounds.y + bounds.height / 2) * scale,
    scale,
  };
}

export function zoom_camera(
  camera: Camera,
  multiplier: number,
  x: number,
  y: number,
): Camera {
  const scale = Math.max(0.07, Math.min(2, camera.scale * multiplier));
  const ratio = scale / camera.scale;
  return {
    x: x - (x - camera.x) * ratio,
    y: y - (y - camera.y) * ratio,
    scale,
  };
}

export function search_concepts(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return mortgage_concepts
    .map((n) => ({
      node: n,
      score:
        n.id === q || n.title.toLowerCase() === q
          ? 0
          : n.aliases.some((a) => a.toLowerCase() === q)
            ? 1
            : n.title.toLowerCase().startsWith(q)
              ? 2
              : n.title.toLowerCase().includes(q)
                ? 3
                : 4,
    }))
    .filter(({ node }) =>
      [node.id, node.title, node.subtitle, node.summary, ...node.aliases].some(
        (s) => s.toLowerCase().includes(q),
      ),
    )
    .sort(
      (a, b) => a.score - b.score || a.node.title.localeCompare(b.node.title),
    )
    .map(({ node }) => node);
}

export function edge_path(from: GraphNode, to: GraphNode) {
  const direction = to.x >= from.x ? 1 : -1;
  const x1 = from.x + (direction * from.width) / 2;
  const x2 = to.x - (direction * to.width) / 2;
  const bend = Math.max(45, Math.abs(x2 - x1) * 0.48);
  return `M ${x1} ${from.y} C ${x1 + direction * bend} ${from.y}, ${x2 - direction * bend} ${to.y}, ${x2} ${to.y}`;
}

// Analytical edges live in their own three-column study. Each label has a
// dedicated horizontal lane at its outer node, never on top of a card.
export function connection_route(from: GraphNode, to: GraphNode) {
  const outer = from.x === 0 ? to : from;
  const side = Math.sign(outer.x);
  const start = side * 125;
  const end = outer.x - (side * outer.width) / 2;
  const lane = side * 260;
  const curve = side * 210;
  const path =
    from.x === 0
      ? `M ${start} 0 C ${curve} 0, ${curve} ${outer.y}, ${lane} ${outer.y} L ${end} ${outer.y}`
      : `M ${end} ${outer.y} L ${lane} ${outer.y} C ${curve} ${outer.y}, ${curve} 0, ${start} 0`;
  return { path, x: side * 375, y: outer.y };
}
export function study_edges(selected: string) {
  return mortgage_relationships.filter(
    (edge) => edge.source === selected || edge.target === selected,
  );
}

// Geometry has one lane per neighbor; the reader retains every explanation.
export function connection_lanes(selected: string) {
  const groups = new Map<string, ReturnType<typeof study_edges>>();
  for (const edge of study_edges(selected)) {
    const other = edge.source === selected ? edge.target : edge.source;
    groups.set(other, [...(groups.get(other) ?? []), edge]);
  }
  return [...groups.entries()].map(([neighbor, relationships]) => {
    const first = relationships[0];
    return {
      id: `${selected}:${neighbor}`,
      source: first.source,
      target: first.target,
      relationships,
      directed: relationships.every(
        (e) => e.kind !== 'comparison' && e.source === first.source,
      ),
      comparison: relationships.every((e) => e.kind === 'comparison'),
      label:
        relationships.length === 1
          ? first.label
          : `${relationships.length} relationships`,
    };
  });
}
