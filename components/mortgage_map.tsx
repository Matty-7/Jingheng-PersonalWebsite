'use client';

// This canvas has explicit pan/zoom keyboard controls; the adjacent List view
// exposes the same content without spatial interaction.
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MortgageCheck } from './mortgage_check';
import { MortgageRelations } from './mortgage_relations';
import { MortgageNavigator } from './mortgage_navigator';
import { useAtlasExpansion } from './use_atlas_expansion';
import type { KeyboardEvent, PointerEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Route,
  Link2,
  Table2,
  ChevronDown,
  Focus,
  Layers,
  List,
  Maximize2,
  Minus,
  Network,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  mortgage_branches,
  mortgage_concepts,
  mortgage_topics,
  mortgage_sources,
  mortgage_relationships,
  mortgage_paths,
} from '@/content/mortgage_concepts';
import {
  connection_route,
  connection_lanes,
  study_edges,
  build_connection_graph,
  build_mortgage_graph,
  concept_index,
  edge_path,
  fit_camera,
  graph_bounds,
  search_concepts,
  topic_index,
  zoom_camera,
} from '@/lib/mortgage_graph';
import type { Camera, GraphNode } from '@/lib/mortgage_graph';

import { atlas_comparisons } from '@/content/atlas_extensions';
import { spread_groups } from '@/content/mortgage_spreads';
import { mechanism_models } from '@/content/mortgage_mechanisms';
import { concept_hash, read_concept_hash } from '@/lib/mortgage_reading';
import { initial_mortgage_state, mortgage_reducer } from '@/lib/mortgage_state';

const branch_index = new Map(
  mortgage_branches.map((branch) => [branch.id, branch]),
);

export function MortgageMap({
  formulas,
}: {
  formulas: Record<string, { html: string; tex: string; variables: string }>;
}) {
  const [state, dispatch] = useReducer(
    mortgage_reducer,
    initial_mortgage_state,
  );
  const {
    comparison_id,
    spread_group,
    depth,
    branch_filter,
    topic_filter,
    view,
    selected,
    reader_open,
    reader_section,
    trail,
    path_id,
  } = state;
  const comparison = atlas_comparisons.find((c) => c.id === comparison_id)!;
  const active_spread_group = spread_groups.find((g) => g.id === spread_group)!;
  const comparison_rows =
    comparison_id === 'spreads' && spread_group !== 'all'
      ? comparison.rows.filter((r) =>
          active_spread_group.concepts.includes(r.id),
        )
      : comparison.rows;
  const [location_ready, set_location_ready] = useState(false);
  const [link_status, set_link_status] = useState('');
  const [query, set_query] = useState('');
  const [search_open, set_search_open] = useState(false);
  const [search_cursor, set_search_cursor] = useState(0);
  const [camera, set_camera] = useState<Camera>({ x: 0, y: 0, scale: 0.5 });
  const [size, set_size] = useState({ width: 1000, height: 650 });
  const [is_dragging, set_is_dragging] = useState(false);
  const [show_help, set_show_help] = useState(false);
  const [expanded, set_expanded] = useState(false);
  const atlas_ref = useRef<HTMLElement>(null);
  const expand_ref = useRef<HTMLButtonElement>(null);
  useAtlasExpansion(expanded, atlas_ref, expand_ref);
  const canvas_ref = useRef<HTMLDivElement>(null);
  const reader_ref = useRef<HTMLElement>(null);
  const paths_ref = useRef<HTMLElement>(null);
  const search_ref = useRef<HTMLInputElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pending_focus = useRef<string | null>(null);
  const has_measured = useRef(false);
  const previous_layout = useRef<{
    key: string;
    width: number;
    height: number;
  } | null>(null);
  const return_focus = useRef<HTMLButtonElement | null>(null);
  const concept = selected ? concept_index.get(selected) : undefined;
  const path = mortgage_paths.find((item) => item.id === path_id);
  const model = mechanism_models.find((item) => item.id === path_id);
  const results = useMemo(() => search_concepts(query).slice(0, 8), [query]);
  const connection_selection = view === 'connections' ? selected : null;
  const graph = useMemo(
    () =>
      view === 'connections' && connection_selection
        ? build_connection_graph(connection_selection)
        : build_mortgage_graph(depth, branch_filter, topic_filter),
    [view, connection_selection, depth, branch_filter, topic_filter],
  );
  const positions = useMemo(
    () => new Map(graph.map((node) => [node.id, node])),
    [graph],
  );
  const bounds = useMemo(() => graph_bounds(graph), [graph]);
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

  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas || view === 'list' || view === 'compare' || view === 'paths')
      return;
    const observer = new ResizeObserver(([entry]) => {
      if (!has_measured.current) {
        previous_layout.current = null;
        has_measured.current = true;
      }
      set_size({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [view]);
  useEffect(() => {
    const restore_location = () => {
      const id = read_concept_hash(
        window.location.hash,
        new Set(concept_index.keys()),
      );
      if (id) {
        dispatch({ type: 'restore_concept', id });
      }
    };
    const frame = window.requestAnimationFrame(() => {
      restore_location();
      set_location_ready(true);
    });
    window.addEventListener('hashchange', restore_location);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', restore_location);
    };
  }, []);

  useEffect(() => {
    if (!location_ready) return;
    const url = new URL(window.location.href);
    url.hash = selected ? concept_hash(selected) : '';
    window.history.replaceState(window.history.state, '', url);
  }, [selected, location_ready]);

  useEffect(() => {
    const key = `${view}:${connection_selection}:${depth}:${branch_filter}:${topic_filter}`;
    const previous = previous_layout.current;
    const focus = pending_focus.current
      ? positions.get(pending_focus.current)
      : undefined;
    if (focus && view === 'map') {
      set_camera({
        x: size.width / 2 - focus.x,
        y: size.height / 2 - focus.y,
        scale: 1,
      });
      pending_focus.current = null;
    } else if (view === 'connections') {
      set_camera(fit_camera(bounds, size.width, size.height));
    } else if (previous?.key === key) {
      set_camera((c) => ({
        ...c,
        x: c.x + (size.width - previous.width) / 2,
        y: c.y + (size.height - previous.height) / 2,
      }));
    } else {
      set_camera(fit_camera(bounds, size.width, size.height));
    }
    previous_layout.current = { key, ...size };
  }, [
    bounds,
    positions,
    size,
    view,
    connection_selection,
    depth,
    branch_filter,
    topic_filter,
  ]);
  useEffect(() => {
    if (!reader_open || !selected) return;
    const reader = reader_ref.current;
    if (!reader) return;
    const target = reader.querySelector<HTMLElement>(
      reader_section === 'connections' ? '#concept-connections' : 'h2',
    );
    target?.focus({ preventScroll: true });
    if (target) {
      const rect = target.getBoundingClientRect();
      // Expansion owns focus on exit; its layout is not a reader focus request.
      const top_inset = reader.closest('[aria-modal="true"]') ? 156 : 88;
      if (rect.top < top_inset || rect.bottom > window.innerHeight - 24)
        target.scrollIntoView({ block: 'start' });
    }
  }, [reader_open, selected, reader_section]);

  function prepare_concept(id: string) {
    const node = positions.get(id);
    const layout_is_ready = depth === 2 && !!node;
    set_link_status('');
    set_search_open(false);
    set_query('');
    if (view === 'map') {
      pending_focus.current = layout_is_ready ? null : id;
      if (layout_is_ready)
        set_camera({
          x: size.width / 2 - node!.x,
          y: size.height / 2 - node!.y,
          scale: 1,
        });
    }
    return layout_is_ready;
  }
  function choose_concept(id: string, trigger?: HTMLButtonElement) {
    if (!concept_index.has(id)) return;
    if (trigger) return_focus.current = trigger;
    dispatch({
      type: 'select_concept',
      id,
      preserve_map_context: prepare_concept(id),
    });
  }
  function close_reader() {
    dispatch({ type: 'close_reader' });
    const target = return_focus.current?.isConnected
      ? return_focus.current
      : (canvas_ref.current ?? search_ref.current);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest' });
  }
  useEffect(() => {
    if (!reader_open && !expanded) return;
    const on_escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        if (reader_open) close_reader();
        else set_expanded(false);
      }
    };
    window.addEventListener('keydown', on_escape);
    return () => window.removeEventListener('keydown', on_escape);
  }, [reader_open, expanded]);

  function follow_history(offset: number) {
    const cursor = trail.cursor + offset;
    if (cursor < 0 || cursor >= trail.ids.length) return;
    dispatch({
      type: 'follow_history',
      offset,
      preserve_map_context: prepare_concept(trail.ids[cursor]),
    });
  }
  async function copy_concept_link() {
    try {
      const url = new URL(window.location.href);
      url.hash = concept_hash(selected!);
      await navigator.clipboard.writeText(url.href);
      set_link_status('Link copied');
    } catch {
      set_link_status('Use the link in your address bar.');
    }
  }
  function focus_selected() {
    const node = selected ? positions.get(selected) : undefined;
    if (node)
      set_camera({
        x: size.width / 2 - node.x,
        y: size.height / 2 - node.y,
        scale: 1,
      });
  }
  function overview() {
    dispatch({ type: 'overview' });
    pending_focus.current = null;
    set_camera(
      fit_camera(
        graph_bounds(build_mortgage_graph(0)),
        size.width,
        size.height,
      ),
    );
  }
  function open_branch(id: string) {
    dispatch({ type: 'open_branch', id });
  }
  function choose_path(id: string) {
    dispatch({ type: 'choose_path', id });
    requestAnimationFrame(() =>
      paths_ref.current
        ?.querySelector<HTMLElement>('h2')
        ?.focus({ preventScroll: true }),
    );
  }
  function activate_node(node: GraphNode, trigger: HTMLButtonElement) {
    if (node.kind === 'concept') choose_concept(node.id, trigger);
    else if (node.kind === 'root') overview();
    else if (node.kind === 'topic') {
      dispatch({ type: 'open_topic', id: node.id, branch: node.branch! });
    } else open_branch(node.branch!);
  }
  function key_canvas(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [90, 0],
      ArrowRight: [-90, 0],
      ArrowUp: [0, 90],
      ArrowDown: [0, -90],
    };
    if (offsets[event.key]) {
      event.preventDefault();
      const [x, y] = offsets[event.key];
      set_camera((c) => ({ ...c, x: c.x + x, y: c.y + y }));
    } else if (['+', '=', '-'].includes(event.key)) {
      event.preventDefault();
      set_camera((c) =>
        zoom_camera(
          c,
          event.key === '-' ? 0.8 : 1.25,
          size.width / 2,
          size.height / 2,
        ),
      );
    } else if (event.key === 'Home') {
      event.preventDefault();
      set_camera(fit_camera(bounds, size.width, size.height));
    }
  }
  function pointer_down(event: PointerEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      (event.target as HTMLElement).closest('button,a,input,select')
    )
      return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    set_is_dragging(true);
  }
  function pointer_move(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const next = { x: event.clientX, y: event.clientY };
    if (pointers.current.size === 2) {
      const other = [...pointers.current.entries()].find(
        ([id]) => id !== event.pointerId,
      )![1];
      const old_distance = Math.hypot(
        previous.x - other.x,
        previous.y - other.y,
      );
      const distance = Math.hypot(next.x - other.x, next.y - other.y);
      const rect = event.currentTarget.getBoundingClientRect();
      const old_x = (previous.x + other.x) / 2 - rect.left;
      const old_y = (previous.y + other.y) / 2 - rect.top;
      set_camera((c) => {
        const zoomed = zoom_camera(
          c,
          old_distance > 0 ? distance / old_distance : 1,
          old_x,
          old_y,
        );
        return {
          ...zoomed,
          x: zoomed.x + (next.x - previous.x) / 2,
          y: zoomed.y + (next.y - previous.y) / 2,
        };
      });
    } else
      set_camera((c) => ({
        ...c,
        x: c.x + next.x - previous.x,
        y: c.y + next.y - previous.y,
      }));
    pointers.current.set(event.pointerId, next);
  }
  function pointer_up(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (!pointers.current.size) set_is_dragging(false);
  }
  function search_keys(event: KeyboardEvent<HTMLInputElement>) {
    dismiss_search(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      set_search_open(true);
      set_search_cursor((index) =>
        Math.max(
          0,
          Math.min(
            results.length - 1,
            index + (event.key === 'ArrowDown' ? 1 : -1),
          ),
        ),
      );
    } else if (event.key === 'Enter' && results[search_cursor]) {
      event.preventDefault();
      choose_concept(results[search_cursor].id);
    }
  }
  function dismiss_search(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape' && search_open && query) {
      event.preventDefault();
      event.stopPropagation();
      search_ref.current?.focus({ preventScroll: true });
      set_search_open(false);
    }
  }
  const visible_topics = mortgage_topics.filter(
    (t) => branch_filter === 'all' || t.branch === branch_filter,
  );

  return (
    <section
      ref={atlas_ref}
      role={expanded ? 'dialog' : 'region'}
      aria-modal={expanded || undefined}
      className={`mortgage-atlas ${expanded ? 'is-expanded' : ''}`}
      aria-label="Interactive mortgage knowledge map"
    >
      <div className="atlas-intro">
        <div>
          <p>
            <strong>{mortgage_concepts.length}</strong> concepts <span>·</span>{' '}
            <strong>{mortgage_branches.length}</strong> domains <span>·</span>{' '}
            <strong>{mortgage_relationships.length}</strong> explained
            connections
          </p>
        </div>
        <div className="atlas-intro-actions">
          <button
            className="atlas-text-button"
            onClick={() => set_show_help(!show_help)}
            aria-expanded={show_help}
          >
            How to explore <ChevronDown size={15} />
          </button>
          <button
            ref={expand_ref}
            className="atlas-expand-button"
            onClick={() => set_expanded(!expanded)}
            aria-label={expanded ? 'Exit expanded map' : 'Expand map'}
            title={expanded ? 'Exit expanded map' : 'Expand map'}
            aria-pressed={expanded}
          >
            {expanded ? <X size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>
      {show_help && (
        <div className="atlas-help">
          <p>
            <strong>Paths</strong> follows a financial mechanism across domains.{' '}
            <strong>Map</strong> shows the hierarchy;{' '}
            <strong>Connections</strong> puts one concept between what informs
            it and what it affects. <strong>Compare</strong> puts spreads,
            products and currencies side by side. <strong>List</strong> lets you
            browse without moving the canvas.
          </p>
          <p>
            Drag empty space to pan. Use + / − to zoom, or pinch on touch
            screens. With the canvas focused, arrow keys pan and Home fits the
            map. Scrolling outside the canvas always scrolls the page; the mouse
            wheel scrolls normally everywhere.
          </p>
        </div>
      )}
      <div className="atlas-toolbar">
        <div className="atlas-search">
          <Search size={17} aria-hidden="true" />
          <input
            ref={search_ref}
            type="search"
            aria-label="Search mortgage concepts"
            placeholder="Find a concept, e.g. OAS"
            value={query}
            onChange={(e) => {
              set_query(e.target.value);
              set_search_open(true);
              set_search_cursor(0);
            }}
            onFocus={() => set_search_open(true)}
            onBlur={(e) => {
              if (
                !e.currentTarget.parentElement?.contains(
                  e.relatedTarget as Node,
                )
              )
                set_search_open(false);
            }}
            onKeyDown={search_keys}
            aria-controls="atlas-search-results"
          />
          {search_open && query && (
            <div
              className="atlas-search-results"
              id="atlas-search-results"
              aria-label="Search results"
            >
              <output className="atlas-result-count">
                {results.length
                  ? 'Matching concepts'
                  : 'No match. Try a shorter term, such as “rate”.'}
              </output>
              {results.map((node, index) => (
                <button
                  key={node.id}
                  className={index === search_cursor ? 'is-current' : ''}
                  onKeyDown={dismiss_search}
                  onClick={(e) => choose_concept(node.id, e.currentTarget)}
                >
                  <span>{node.title}</span>
                  <small>
                    {branch_index.get(node.branch)?.title} /{' '}
                    {topic_index.get(node.topic)?.title}
                  </small>
                  <ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="atlas-view-toggle" aria-label="Reading view">
          <button
            aria-pressed={view === 'paths'}
            onClick={() => dispatch({ type: 'change_view', view: 'paths' })}
          >
            <Route size={16} />
            <span>Paths</span>
          </button>
          <button
            aria-pressed={view === 'compare'}
            onClick={() => dispatch({ type: 'change_view', view: 'compare' })}
          >
            <Table2 size={16} />
            <span>Compare</span>
          </button>
          <button
            aria-pressed={view === 'map'}
            onClick={() => dispatch({ type: 'change_view', view: 'map' })}
          >
            <Network size={16} />
            <span>Map</span>
          </button>
          <button
            aria-pressed={view === 'connections'}
            onClick={() =>
              dispatch({ type: 'change_view', view: 'connections' })
            }
          >
            <ArrowRight size={16} />
            <span>Connections</span>
          </button>
          <button
            aria-pressed={view === 'list'}
            onClick={() => dispatch({ type: 'change_view', view: 'list' })}
          >
            <List size={16} />
            <span>List</span>
          </button>
        </div>
      </div>
      {(view === 'map' || view === 'list') && (
        <div className="atlas-options">
          <div className="atlas-depth" aria-label="Map detail level">
            <Layers size={15} aria-hidden="true" />
            {['Overview', 'Topics', 'All concepts'].map((label, i) => (
              <button
                key={label}
                aria-pressed={depth === i && view === 'map'}
                onClick={() => dispatch({ type: 'set_depth', depth: i })}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="atlas-domain-select">
            <span>Focus</span>
            <select
              value={branch_filter}
              onChange={(e) =>
                dispatch({ type: 'filter_domain', id: e.target.value })
              }
              aria-label="Focus a domain"
            >
              <option value="all">All domains</option>
              {mortgage_branches.map((branch) => (
                <option value={branch.id} key={branch.id}>
                  {branch.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div
        className={`atlas-workspace ${reader_open && concept ? 'has-reader' : ''}`}
      >
        <div
          className={`atlas-map-column ${view === 'map' || view === 'connections' ? 'is-spatial' : ''}`}
        >
          {view === 'paths' ? (
            <section
              className="atlas-models"
              aria-label="Reading paths"
              key={path_id || 'path_index'}
              ref={paths_ref}
            >
              {path ? (
                <>
                  <button
                    className="atlas-text-button"
                    onClick={() => choose_path('')}
                  >
                    <ArrowLeft size={15} /> All paths
                  </button>
                  <h2 tabIndex={-1}>{path.title}</h2>
                  <p className="atlas-model-premise">
                    {model?.premise ?? path.description}
                  </p>
                  <ol className="atlas-model-steps">
                    {path.steps.map((id, index) => {
                      const node = concept_index.get(id)!;
                      const previous = path.steps[index - 1];
                      const edge = mortgage_relationships.find(
                        (e) =>
                          (e.source === previous && e.target === id) ||
                          (e.source === id && e.target === previous),
                      );
                      return (
                        <li key={id}>
                          <span className="atlas-step-number">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <button
                              onClick={(e) =>
                                choose_concept(id, e.currentTarget)
                              }
                              aria-current={
                                selected === id && reader_open
                                  ? 'step'
                                  : undefined
                              }
                            >
                              {node.title}
                              <ArrowUpRight size={16} />
                            </button>
                            <p>
                              {model?.explanations[index] ??
                                (index === 0 ? node.summary : edge?.reason)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  {model && (
                    <div className="atlas-model-boundary">
                      <strong>Where this can change</strong>
                      <p>{model.boundary}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 tabIndex={-1}>Follow a mechanism.</h2>
                  <div className="atlas-model-cards">
                    {mortgage_paths.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => choose_path(item.id)}
                      >
                        <span>
                          {String(index + 1).padStart(2, '0')}
                          <ArrowUpRight size={17} />
                        </span>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                        <small>{item.steps.length} concepts</small>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>
          ) : view === 'compare' ? (
            <div
              className="atlas-comparison"
              aria-label="Financial comparisons"
            >
              <div
                className="atlas-comparison-tabs"
                aria-label="Comparison subject"
              >
                {atlas_comparisons.map((item) => (
                  <button
                    key={item.id}
                    aria-pressed={comparison_id === item.id}
                    onClick={() => {
                      dispatch({ type: 'choose_comparison', id: item.id });
                    }}
                  >
                    {item.id === 'spreads'
                      ? 'Spreads'
                      : item.id === 'products'
                        ? 'Products'
                        : item.id === 'maturities'
                          ? 'Time & maturity'
                          : item.id === 'dates'
                            ? 'Dates'
                            : item.id === 'curves'
                              ? 'Curves'
                              : 'Currencies'}
                  </button>
                ))}
              </div>
              <div className="atlas-comparison-heading" key={comparison.id}>
                <span className="atlas-kicker">{comparison.eyebrow}</span>
                <h2>{comparison.title}</h2>
                <p>{comparison.intro}</p>
              </div>
              {comparison_id === 'spreads' && (
                <div
                  className="atlas-spread-filters"
                  aria-label="Spread families"
                >
                  {spread_groups.map((group) => (
                    <button
                      key={group.id}
                      aria-pressed={spread_group === group.id}
                      onClick={() => {
                        dispatch({ type: 'filter_spreads', id: group.id });
                      }}
                    >
                      {group.title}
                    </button>
                  ))}
                  <output aria-live="polite">
                    {comparison_rows.length} measures
                  </output>
                </div>
              )}
              <section
                className="atlas-table-scroll"
                tabIndex={0}
                aria-label={`${comparison.id} comparison table`}
              >
                <table className="atlas-comparison-table">
                  <caption className="sr-only">
                    {comparison.title} Select a measure to read its definition
                    and connections.
                  </caption>
                  <thead>
                    <tr>
                      {comparison.columns.map((col) => (
                        <th key={col} scope="col">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparison_rows.map((row) => (
                      <tr
                        key={row.id}
                        className={
                          selected === row.id && reader_open
                            ? 'is-selected'
                            : ''
                        }
                      >
                        <th scope="row">
                          <button
                            aria-label={`Read ${row.cells[0]}`}
                            onClick={(e) =>
                              choose_concept(row.id, e.currentTarget)
                            }
                          >
                            {row.cells[0]}
                            <ArrowUpRight size={14} />
                          </button>
                        </th>
                        {row.cells.slice(1).map((cell, i) => (
                          <td key={i} data-label={comparison.columns[i + 1]}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <div className="atlas-comparison-note">
                <span>THE DISTINCTION THAT MATTERS</span>
                <p>{comparison.takeaway}</p>
              </div>
            </div>
          ) : view === 'list' ? (
            <div
              className="atlas-list"
              aria-label="Mortgage concepts by domain and topic"
            >
              {mortgage_branches
                .filter(
                  (b) => branch_filter === 'all' || b.id === branch_filter,
                )
                .map((branch) => (
                  <section key={branch.id} className="atlas-list-domain">
                    <header>
                      <span>{branch.number}</span>
                      <h2>{branch.title}</h2>
                      <p>{branch.question}</p>
                    </header>
                    {visible_topics
                      .filter((t) => t.branch === branch.id)
                      .map((topic) => (
                        <div className="atlas-list-topic" key={topic.id}>
                          <h3>{topic.title}</h3>
                          <div>
                            {topic.concepts.map((id) => {
                              const node = concept_index.get(id)!;
                              return (
                                <button
                                  key={id}
                                  aria-pressed={selected === id}
                                  onClick={(e) =>
                                    choose_concept(id, e.currentTarget)
                                  }
                                >
                                  <span>{node.title}</span>
                                  <small>{node.subtitle}</small>
                                  <ArrowUpRight size={15} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </section>
                ))}
            </div>
          ) : (
            <div className="atlas-graph-shell">
              {view === 'map' && (depth > 0 || camera.scale < 0.55) && (
                <MortgageNavigator
                  branch={branch_filter}
                  topic={topic_filter}
                  open_branch={open_branch}
                  overview={overview}
                  choose_concept={choose_concept}
                  open_topic={(id, branch) =>
                    dispatch({ type: 'open_topic', id, branch })
                  }
                />
              )}
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
                  className="atlas-world"
                  style={{
                    transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
                  }}
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
                      const {
                        path: route,
                        x,
                        y,
                      } = connection_route(source, target);
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
                            markerEnd={
                              edge.directed ? 'url(#atlas-arrow)' : undefined
                            }
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
                                <text
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                >
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
                            return_focus.current = event.currentTarget;
                            dispatch({ type: 'read_connections' });
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
                        const rect = e.currentTarget.getBoundingClientRect();
                        const frame =
                          canvas_ref.current?.getBoundingClientRect();
                        if (
                          frame &&
                          (rect.left < frame.left ||
                            rect.right > frame.right ||
                            rect.top < frame.top ||
                            rect.bottom > frame.bottom)
                        )
                          set_camera((c) => ({
                            ...c,
                            x: size.width / 2 - node.x * c.scale,
                            y: size.height / 2 - node.y * c.scale,
                          }));
                      }}
                      aria-label={
                        node.kind === 'root'
                          ? 'Return to the whole map'
                          : node.kind === 'branch' || node.kind === 'topic'
                            ? `Explore ${node.title}`
                            : `Read ${node.title}`
                      }
                      aria-pressed={
                        node.kind === 'concept'
                          ? selected === node.id
                          : undefined
                      }
                    >
                      {node.kind === 'root' ? (
                        <>
                          <strong>
                            Mortgage <em>Map.</em>
                          </strong>
                          <small>Borrowers, securities and risk</small>
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
                                mortgage_topics.filter(
                                  (t) => t.branch === node.id,
                                ).length
                              }{' '}
                              topics ·{' '}
                              {
                                mortgage_concepts.filter(
                                  (c) => c.branch === node.id,
                                ).length
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
                      onClick={() =>
                        set_camera((c) =>
                          zoom_camera(c, 0.8, size.width / 2, size.height / 2),
                        )
                      }
                    >
                      <Minus size={18} />
                    </button>
                    <span aria-live="polite">
                      {Math.round(camera.scale * 100)}%
                    </span>
                    <button
                      aria-label="Zoom in"
                      title="Zoom in"
                      onClick={() =>
                        set_camera((c) =>
                          zoom_camera(c, 1.25, size.width / 2, size.height / 2),
                        )
                      }
                    >
                      <Plus size={18} />
                    </button>
                    <span className="atlas-control-divider" />
                    <button
                      aria-label="Fit map"
                      title="Fit map"
                      onClick={() =>
                        set_camera(fit_camera(bounds, size.width, size.height))
                      }
                    >
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
                    const rect = event.currentTarget.getBoundingClientRect();
                    const sx = bounds.width / rect.width;
                    const sy = bounds.height / rect.height;
                    const x = bounds.x + (event.clientX - rect.left) * sx;
                    const y = bounds.y + (event.clientY - rect.top) * sy;
                    if (event.detail === 0)
                      set_camera(fit_camera(bounds, size.width, size.height));
                    else
                      set_camera((c) => ({
                        ...c,
                        x: size.width / 2 - x * c.scale,
                        y: size.height / 2 - y * c.scale,
                      }));
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
          )}
          {(view === 'map' || view === 'connections') && (
            <div className="atlas-legend">
              <span>
                <i />
                Hierarchy
              </span>
              <span>
                <i className="relationship-key" />
                Directed relationship
              </span>
              <span>
                <i className="comparison-key" />
                Comparison
              </span>
              <button onClick={overview}>
                Back to overview <ArrowUpRight size={13} />
              </button>
            </div>
          )}
        </div>
        {reader_open && concept && (
          <aside
            className="atlas-reader"
            key={selected}
            ref={reader_ref}
            aria-label="Concept reader"
          >
            <div className="atlas-reader-top">
              <span>
                {branch_index.get(concept.branch)?.number} /{' '}
                {branch_index.get(concept.branch)?.title}
              </span>
              <button onClick={close_reader} aria-label="Close concept reader">
                <X size={18} />
              </button>
            </div>
            <div
              className="atlas-reader-navigation"
              aria-label="Concept history"
            >
              <button
                onClick={() => follow_history(-1)}
                disabled={trail.cursor <= 0}
                aria-label="Previous concept"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={() => follow_history(1)}
                disabled={trail.cursor >= trail.ids.length - 1}
                aria-label="Next concept in history"
              >
                <ArrowRight size={15} />
              </button>
              <button onClick={copy_concept_link}>
                <Link2 size={14} /> Copy link
              </button>
              <output>{link_status}</output>
            </div>
            <p className="atlas-reader-topic">
              {topic_index.get(concept.topic)?.title}
            </p>
            <h2 tabIndex={-1}>{concept.title}</h2>
            <p className="atlas-reader-subtitle">{concept.subtitle}</p>
            <p className="atlas-reader-summary">{concept.summary}</p>
            {path && path.steps.includes(concept.id) && (
              <div className="atlas-reader-path">
                <button
                  onClick={() => {
                    dispatch({ type: 'change_view', view: 'paths' });
                  }}
                >
                  <Route size={14} /> {path.title}
                </button>
                <div>
                  <span>
                    Step {path.steps.indexOf(concept.id) + 1} of{' '}
                    {path.steps.length}
                  </span>
                  <button
                    disabled={path.steps.indexOf(concept.id) === 0}
                    onClick={() =>
                      choose_concept(
                        path.steps[path.steps.indexOf(concept.id) - 1],
                      )
                    }
                    aria-label="Previous path step"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <button
                    disabled={
                      path.steps.indexOf(concept.id) === path.steps.length - 1
                    }
                    onClick={() =>
                      choose_concept(
                        path.steps[path.steps.indexOf(concept.id) + 1],
                      )
                    }
                    aria-label="Next path step"
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
            {concept.formula && (
              <div className="atlas-formula">
                <span>THE RELATIONSHIP</span>
                <div
                  className="atlas-math"
                  dangerouslySetInnerHTML={{
                    __html: formulas[concept.id].html,
                  }}
                />
                <p className="atlas-math-variables">
                  {formulas[concept.id].variables}
                </p>
                <small>{concept.formula.assumptions}</small>
                {concept.formula.example && (
                  <p className="atlas-formula-example">
                    {concept.formula.example}
                  </p>
                )}
              </div>
            )}
            <div className="atlas-distinction">
              <span>KEEP THIS DISTINCTION</span>
              <p>{concept.distinction}</p>
            </div>
            <MortgageRelations
              relations={relations}
              choose_concept={choose_concept}
              explore={() => {
                dispatch({ type: 'read_connections', change_view: true });
              }}
            />
            <MortgageCheck
              key={concept.id}
              id={concept.id}
              question={concept.question}
              answer={concept.answer}
            />
            <details className="atlas-further">
              <summary>
                Related reading <ChevronDown size={15} />
              </summary>
              {concept.links.map((link) => (
                <button
                  key={link.id}
                  onClick={(e) => choose_concept(link.id, e.currentTarget)}
                >
                  <span>
                    {concept_index.get(link.id)?.title}{' '}
                    <ArrowUpRight size={13} />
                  </span>
                  <small>{link.reason}</small>
                </button>
              ))}
            </details>
            <section className="atlas-sources">
              <h3>Read the source</h3>
              {concept.sources.map((id) => {
                const source = mortgage_sources[id];
                return (
                  <a
                    key={id}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>
                      {source.publisher}
                      <ArrowUpRight size={14} />
                    </span>
                    <small>{source.title}</small>
                  </a>
                );
              })}
            </section>
          </aside>
        )}
      </div>
    </section>
  );
}
