'use client';

import { atlas_lenses, lens_definition } from '@/content/fixed_income_lenses';
import { lens_catalog } from '@/lib/mortgage_graph';
import { useMemo, useReducer, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Route,
  Table2,
  ChevronDown,
  Layers,
  List,
  Maximize2,
  Network,
  Search,
  X,
} from 'lucide-react';
import {
  mortgage_branches,
  mortgage_concepts,
  mortgage_relationships,
} from '@/content/mortgage_concepts';
import {
  build_connection_graph,
  build_mortgage_graph,
  concept_index,
  search_concepts,
  topic_index,
  type GraphNode,
} from '@/lib/mortgage_graph';
import { initial_mortgage_state, mortgage_reducer } from '@/lib/mortgage_state';
import { useAtlasExpansion } from './use_atlas_expansion';
import { useMortgageCamera } from './use_mortgage_camera';
import { useMortgageReader } from './use_mortgage_reader';
import { MortgageCanvas } from './mortgage_canvas';
import { MortgageReader, type MortgageFormulas } from './mortgage_reader';
import { MortgagePaths } from './mortgage_paths';
import { MortgageComparison } from './mortgage_comparison';
import { MortgageList } from './mortgage_list';

const branch_index = new Map(
  mortgage_branches.map((branch) => [branch.id, branch]),
);

export function MortgageMap({ formulas }: { formulas: MortgageFormulas }) {
  const [state, dispatch] = useReducer(
    mortgage_reducer,
    initial_mortgage_state,
  );
  const {
    lens,
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
  const catalog = useMemo(() => lens_catalog(lens), [lens]);
  const lens_info = lens_definition(lens);
  const [query, set_query] = useState('');
  const [search_open, set_search_open] = useState(false);
  const [search_cursor, set_search_cursor] = useState(0);
  const [show_help, set_show_help] = useState(false);
  const [show_options, set_show_options] = useState(false);
  const [expanded, set_expanded] = useState(false);
  const atlas_ref = useRef<HTMLElement>(null);
  const expand_ref = useRef<HTMLButtonElement>(null);
  useAtlasExpansion(expanded, atlas_ref, expand_ref);
  const paths_ref = useRef<HTMLElement>(null);
  const search_ref = useRef<HTMLInputElement>(null);
  const concept = selected ? concept_index.get(selected) : undefined;
  const results = useMemo(() => search_concepts(query).slice(0, 8), [query]);
  const connection_selection = view === 'connections' ? selected : null;
  const graph = useMemo(
    () =>
      view === 'connections' && connection_selection
        ? build_connection_graph(connection_selection)
        : build_mortgage_graph(depth, branch_filter, topic_filter, lens),
    [view, connection_selection, depth, branch_filter, topic_filter, lens],
  );
  const spatial = useMortgageCamera({
    graph,
    lens,
    view,
    selected,
    depth,
    branch_filter,
    topic_filter,
  });
  const reading = useMortgageReader({
    selected,
    reader_open,
    reader_section,
    expanded,
    set_expanded,
    dispatch,
    canvas_ref: spatial.canvas_ref,
    search_ref,
  });
  function prepare_concept(id: string) {
    reading.clear_link_status();
    set_search_open(false);
    set_query('');
    return spatial.prepare_concept(id);
  }
  function choose_concept(id: string, trigger?: HTMLButtonElement) {
    if (!concept_index.has(id)) return;
    reading.remember_trigger(trigger);
    dispatch({
      type: 'select_concept',
      id,
      preserve_map_context: prepare_concept(id),
    });
  }
  function follow_history(offset: number) {
    const cursor = trail.cursor + offset;
    if (cursor < 0 || cursor >= trail.ids.length) return;
    dispatch({
      type: 'follow_history',
      offset,
      preserve_map_context: prepare_concept(trail.ids[cursor]),
    });
  }
  function overview() {
    dispatch({ type: 'overview' });
    spatial.overview();
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
  return (
    <section
      ref={atlas_ref}
      role={expanded ? 'dialog' : 'region'}
      aria-modal={expanded || undefined}
      className={`mortgage-atlas ${expanded ? 'is-expanded' : ''}`}
      aria-label="Interactive mortgage knowledge map"
    >
      <fieldset className="atlas-lenses" aria-label="Atlas subject">
        {atlas_lenses.map(item => <button key={item.id} aria-pressed={lens === item.id} onClick={() => { dispatch({ type: 'change_lens', lens: item.id }); set_query(''); set_search_open(false); }}>
          {item.title}
        </button>)}
      </fieldset>
      <output className="atlas-lens-description">{lens_info.description} <span>{catalog.concepts.length} of {mortgage_concepts.length} concepts in this lens.</span></output>
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
            products and currencies side by side. Search covers the whole atlas and opens All fixed income when a concept sits outside your lens. <strong>List</strong> lets you
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
            placeholder="Search the whole atlas, e.g. OAS"
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
        <>
          <div className="atlas-map-tools">
            <button
              className="atlas-disclosure"
              aria-expanded={show_options}
              aria-controls="atlas-map-options"
              onClick={() => set_show_options(!show_options)}
            >
              Map settings <ChevronDown size={15} />
            </button>
            {view === 'map' &&
            depth === 0 &&
            branch_filter === 'all' &&
            !reader_open ? (
              <div className="atlas-start">
                <button onClick={() => choose_path('')}>
                  Start with a reading path <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <span className="atlas-settings-state">
                {view === 'map'
                  ? `${['Overview', 'Topics', 'All concepts'][depth]} · `
                  : ''}
                {branch_index.get(branch_filter)?.title ?? 'All domains'}
              </span>
            )}
          </div>
          <div
            className="atlas-options"
            id="atlas-map-options"
            hidden={!show_options}
          >
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
                {catalog.branches.map((branch) => (
                  <option value={branch.id} key={branch.id}>
                    {branch.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}
      {(view === 'compare' || view === 'connections') && <p className="atlas-global-scope">{view === 'compare' ? 'Comparisons cover the whole atlas.' : 'Connections include every related domain, across all lenses.'}</p>}
      <div
        className={`atlas-workspace ${reader_open && concept ? 'has-reader' : ''}`}
      >
        <div
          className={`atlas-map-column ${view === 'map' || view === 'connections' ? 'is-spatial' : ''}`}
        >
          {view === 'paths' ? (
            <MortgagePaths
              lens={lens}
              path_id={path_id}
              selected={selected}
              reader_open={reader_open}
              paths_ref={paths_ref}
              choose_path={choose_path}
              choose_concept={choose_concept}
            />
          ) : view === 'compare' ? (
            <MortgageComparison
              comparison_id={comparison_id}
              spread_group={spread_group}
              selected={selected}
              reader_open={reader_open}
              choose_comparison={(id) =>
                dispatch({ type: 'choose_comparison', id })
              }
              filter_spreads={(id) => dispatch({ type: 'filter_spreads', id })}
              choose_concept={choose_concept}
            />
          ) : view === 'list' ? (
            <MortgageList
              lens={lens}
              branch_filter={branch_filter}
              selected={selected}
              choose_concept={choose_concept}
            />
          ) : (
            <MortgageCanvas
              lens={lens}
              graph={graph}
              controls={spatial}
              view={view}
              depth={depth}
              branch_filter={branch_filter}
              topic_filter={topic_filter}
              selected={selected}
              open_branch={open_branch}
              open_topic={(id, branch) =>
                dispatch({ type: 'open_topic', id, branch })
              }
              overview={overview}
              choose_concept={choose_concept}
              activate_node={activate_node}
              read_connections={(trigger) => {
                reading.remember_trigger(trigger);
                dispatch({ type: 'read_connections' });
              }}
            />
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
          <MortgageReader
            key={selected}
            concept={concept}
            formulas={formulas}
            path_id={path_id}
            trail={trail}
            reader_ref={reading.reader_ref}
            link_status={reading.link_status}
            close_reader={reading.close_reader}
            follow_history={follow_history}
            copy_concept_link={reading.copy_concept_link}
            choose_concept={choose_concept}
            show_paths={() => dispatch({ type: 'change_view', view: 'paths' })}
            explore_connections={() =>
              dispatch({ type: 'read_connections', change_view: true })
            }
          />
        )}
      </div>
    </section>
  );
}
