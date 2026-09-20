// The keyboard canvas is paired with a non-spatial List view.
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { ArrowUpRight, Focus, Maximize2, Minus, Plus } from 'lucide-react';
import {
  mortgage_branches,
  mortgage_concepts,
  mortgage_topics,
} from '@/content/mortgage_concepts';
import {
  concept_index,
  topic_index,
  study_edges,
  connection_lanes,
  connection_route,
  edge_path,
  type GraphNode,
} from '@/lib/mortgage_graph';
import type { MortgageView } from '@/lib/mortgage_state';
import type { MortgageCamera } from './use_mortgage_camera';
import { MortgageNavigator } from './mortgage_navigator';
const branch_index = new Map(
  mortgage_branches.map((branch) => [branch.id, branch]),
);

export function MortgageCanvas({
  graph,
  controls,
  view,
  depth,
  branch_filter,
  topic_filter,
  selected,
  open_branch,
  open_topic,
  overview,
  choose_concept,
  activate_node,
  read_connections,
}: {
  graph: GraphNode[];
  controls: MortgageCamera;
  view: MortgageView;
  depth: number;
  branch_filter: string;
  topic_filter: string;
  selected: string | null;
  open_branch: (id: string) => void;
  open_topic: (id: string, branch: string) => void;
  overview: () => void;
  choose_concept: (id: string, trigger?: HTMLButtonElement) => void;
  activate_node: (node: GraphNode, trigger: HTMLButtonElement) => void;
  read_connections: (trigger: HTMLButtonElement) => void;
}) {
  const {
    camera,
    size,
    positions,
    bounds,
    canvas_ref,
    is_dragging,
    zoom,
    fit,
    focus_selected,
    reveal_node,
    recenter,
    key_canvas,
    pointer_down,
    pointer_move,
    pointer_up,
  } = controls;
  const concept = selected ? concept_index.get(selected) : undefined;
  const compact_overview = view === 'map' && depth === 0 && camera.scale < 0.85;
  const show_navigator = view === 'map' && (depth > 0 || camera.scale < 0.55);
  const relations = useMemo(
    () => (selected ? study_edges(selected) : []),
    [selected],
  );
  const neighbors = useMemo(
    () => new Set(relations.flatMap((edge) => [edge.source, edge.target])),
    [relations],
  );
  const active_edges = useMemo(
    () =>
      view === 'connections' && selected ? connection_lanes(selected) : [],
    [view, selected],
  );

  return (
    <div className="atlas-graph-shell">
      {show_navigator && (
        <MortgageNavigator
          key={`${depth === 0 ? 'overview' : 'detail'}:${branch_filter}:${topic_filter}`}
          branch={branch_filter}
          topic={topic_filter}
          expanded_by_default={depth === 0 && camera.scale < 0.55}
          show_scale_hint={camera.scale < 0.55}
          open_branch={open_branch}
          overview={overview}
          choose_concept={choose_concept}
          open_topic={(id, branch) => open_topic(id, branch)}
        />
      )}
      {!show_navigator && (
        <div className="atlas-canvas-caption">
          <p>
            {view === 'connections'
              ? concept?.title
              : branch_filter === 'all'
                ? depth === 0
                  ? 'All domains'
                  : depth === 1
                    ? 'All topics'
                    : 'All concepts'
                : topic_filter === 'all'
                  ? branch_index.get(branch_filter)?.title
                  : topic_index.get(topic_filter)?.title}
          </p>
          {camera.scale < 0.55 && (
            <small className="atlas-scale-hint">
              Zoom in to read, or switch to List.
            </small>
          )}
        </div>
      )}
      <div
        ref={canvas_ref}
        className={`atlas-canvas ${is_dragging ? 'is-dragging' : ''}`}
        role="application"
        aria-roledescription="interactive map"
        aria-label="Mortgage map canvas. Arrow keys pan, plus and minus zoom, Home fits the map."
        tabIndex={0}
        onKeyDown={key_canvas}
        onPointerDown={pointer_down}
        onPointerMove={pointer_move}
        onPointerUp={pointer_up}
        onPointerCancel={pointer_up}
      >
        <div
          className={`atlas-world ${compact_overview ? 'is-compact-overview' : ''}`}
          style={
            {
              transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
              '--atlas-overview-title-size': `${Math.min(32, Math.max(20, 16 / camera.scale))}px`,
            } as CSSProperties
          }
        >
          <svg className="atlas-edges" aria-hidden="true">
            <defs>
              <marker
                id="atlas-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor" />
              </marker>
            </defs>
            {graph
              .filter((node) => node.parent)
              .map((node) => (
                <path
                  key={`${node.parent}-${node.id}`}
                  className={`atlas-tree-edge ${selected ? 'is-muted' : ''}`}
                  d={edge_path(positions.get(node.parent!)!, node)}
                />
              ))}
            {active_edges.map((edge) => {
              const source = positions.get(edge.source)!;
              const target = positions.get(edge.target)!;
              const { path: route, x, y } = connection_route(source, target);
              return (
                <g
                  key={edge.id}
                  className={`atlas-relation ${edge.comparison ? 'is-comparison' : ''}`}
                >
                  <title>
                    {edge.relationships
                      .map(
                        (e) =>
                          `${concept_index.get(e.source)?.title} ${e.kind === 'comparison' ? '↔' : '→'} ${concept_index.get(e.target)?.title}: ${e.reason}`,
                      )
                      .join('\n')}
                  </title>
                  <path
                    d={route}
                    markerEnd={edge.directed ? 'url(#atlas-arrow)' : undefined}
                  />
                  {view === 'connections' &&
                    edge.relationships.length === 1 && (
                      <g transform={`translate(${x}, ${y})`}>
                        <rect
                          x={-108}
                          y={-12}
                          width={216}
                          height={24}
                          rx={12}
                        />
                        <text textAnchor="middle" dominantBaseline="central">
                          {edge.label}
                        </text>
                      </g>
                    )}
                </g>
              );
            })}
          </svg>
          {active_edges
            .filter((edge) => edge.relationships.length > 1)
            .map((edge) => {
              const lane = connection_route(
                positions.get(edge.source)!,
                positions.get(edge.target)!,
              );
              return (
                <button
                  key={edge.id}
                  className="atlas-edge-label"
                  style={{ left: lane.x - 108, top: lane.y - 18 }}
                  aria-label={`Read all ${edge.relationships.length} relationships between ${concept_index.get(edge.source)?.title} and ${concept_index.get(edge.target)?.title}`}
                  onClick={(event) => {
                    read_connections(event.currentTarget);
                  }}
                >
                  {edge.label}
                </button>
              );
            })}
          {graph.map((node) => (
            <button
              key={node.id}
              className={`atlas-node node-${node.kind} ${selected === node.id ? 'is-selected' : ''} ${selected && neighbors.has(node.id) ? 'is-neighbor' : ''} ${selected && view === 'map' && node.kind === 'concept' && !neighbors.has(node.id) ? 'is-dimmed' : ''}`}
              data-node-id={node.id}
              data-branch={node.branch}
              style={{
                left: node.x - node.width / 2,
                top: node.y - node.height / 2,
                width: node.width,
                height: node.height,
              }}
              onClick={(e) => activate_node(node, e.currentTarget)}
              onFocus={(e) => {
                reveal_node(node, e.currentTarget);
              }}
              aria-label={
                node.kind === 'root'
                  ? 'Return to the whole map'
                  : node.kind === 'branch' || node.kind === 'topic'
                    ? `Explore ${node.title}`
                    : `Read ${node.title}`
              }
              aria-pressed={
                node.kind === 'concept' ? selected === node.id : undefined
              }
            >
              {node.kind === 'root' ? (
                <>
                  <strong>
                    {node.title}
                  </strong>
                  <small>{node.subtitle}</small>
                </>
              ) : (
                <>
                  {node.kind === 'branch' && (
                    <span className="atlas-node-number">
                      {branch_index.get(node.id)?.number}
                    </span>
                  )}
                  <strong>{node.title}</strong>
                  <small>{node.subtitle}</small>
                  {node.kind === 'branch' && (
                    <span className="atlas-branch-count">
                      {
                        mortgage_topics.filter((t) => t.branch === node.id)
                          .length
                      }{' '}
                      topics ·{' '}
                      {
                        mortgage_concepts.filter((c) => c.branch === node.id)
                          .length
                      }{' '}
                      concepts <ArrowUpRight size={12} />
                    </span>
                  )}
                  {node.kind === 'topic' && (
                    <Plus className="atlas-node-expand" size={14} />
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="atlas-canvas-dock">
        <div className="atlas-canvas-bottom">
          <div className="atlas-zoom" aria-label="Map navigation">
            <button
              aria-label="Zoom out"
              title="Zoom out"
              onClick={() => zoom(0.8)}
            >
              <Minus size={18} />
            </button>
            <span aria-live="polite">{Math.round(camera.scale * 100)}%</span>
            <button
              aria-label="Zoom in"
              title="Zoom in"
              onClick={() => zoom(1.25)}
            >
              <Plus size={18} />
            </button>
            <span className="atlas-control-divider" />
            <button aria-label="Fit map" title="Fit map" onClick={() => fit()}>
              <Maximize2 size={17} />
            </button>
            <button
              aria-label="Focus selected concept"
              title="Focus selected concept"
              disabled={!selected || !positions.has(selected)}
              onClick={focus_selected}
            >
              <Focus size={18} />
            </button>
          </div>
          <span className="atlas-pan-hint">
            Drag to explore · + / − to zoom
          </span>
        </div>
        <button
          className="atlas-minimap"
          aria-label="Recenter map at a point in the overview"
          onClick={(event) => {
            recenter(event);
          }}
        >
          <svg
            viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {graph.map((n) => (
              <rect
                key={n.id}
                x={n.x - n.width / 2}
                y={n.y - n.height / 2}
                width={n.width}
                height={n.height}
                className={n.id === selected ? 'is-selected' : ''}
              />
            ))}
            <rect
              className="atlas-viewport"
              x={-camera.x / camera.scale}
              y={-camera.y / camera.scale}
              width={size.width / camera.scale}
              height={size.height / camera.scale}
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
