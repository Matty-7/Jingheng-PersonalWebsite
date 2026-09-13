import { concept_index } from './mortgage_graph.ts';
import { visit_concept, type ReadingTrail } from './mortgage_reading.ts';

export type MortgageView = 'map' | 'connections' | 'list' | 'compare' | 'paths';
type ReaderSection = 'title' | 'connections';

export type MortgageState = {
  view: MortgageView;
  selected: string | null;
  reader_open: boolean;
  reader_section: ReaderSection;
  trail: ReadingTrail;
  depth: number;
  branch_filter: string;
  topic_filter: string;
  path_id: string;
  comparison_id: string;
  spread_group: string;
};

export const initial_mortgage_state: MortgageState = {
  view: 'map',
  selected: null,
  reader_open: false,
  reader_section: 'title',
  trail: { ids: [], cursor: -1 },
  depth: 0,
  branch_filter: 'all',
  topic_filter: 'all',
  path_id: '',
  comparison_id: 'spreads',
  spread_group: 'all',
};

export type MortgageAction =
  | { type: 'select_concept'; id: string; preserve_map_context: boolean }
  | { type: 'follow_history'; offset: number; preserve_map_context: boolean }
  | { type: 'restore_concept'; id: string }
  | { type: 'close_reader' }
  | { type: 'overview' }
  | { type: 'open_branch'; id: string }
  | { type: 'open_topic'; id: string; branch: string }
  | { type: 'set_depth'; depth: number }
  | { type: 'filter_domain'; id: string }
  | { type: 'change_view'; view: MortgageView }
  | { type: 'choose_path'; id: string }
  | { type: 'choose_comparison'; id: string }
  | { type: 'filter_spreads'; id: string }
  | { type: 'read_connections'; change_view?: boolean };

function select_concept(
  state: MortgageState,
  id: string,
  preserve_map_context: boolean,
): MortgageState {
  const concept = concept_index.get(id);
  if (!concept) return state;
  return {
    ...state,
    selected: id,
    reader_open: true,
    reader_section: 'title',
    ...(state.view === 'map' && {
      depth: 2,
      ...(!preserve_map_context && {
        branch_filter: concept.branch,
        topic_filter: concept.topic,
      }),
    }),
  };
}

export function mortgage_reducer(
  state: MortgageState,
  action: MortgageAction,
): MortgageState {
  switch (action.type) {
    case 'select_concept': {
      const next = select_concept(
        state,
        action.id,
        action.preserve_map_context,
      );
      return next === state
        ? state
        : { ...next, trail: visit_concept(state.trail, action.id) };
    }
    case 'follow_history': {
      const cursor = state.trail.cursor + action.offset;
      const id = state.trail.ids[cursor];
      if (!id) return state;
      return {
        ...select_concept(state, id, action.preserve_map_context),
        trail: { ...state.trail, cursor },
      };
    }
    case 'restore_concept':
      if (!concept_index.has(action.id)) return state;
      return {
        ...state,
        view: 'connections',
        selected: action.id,
        reader_open: true,
        reader_section: 'title',
        trail: visit_concept(state.trail, action.id),
      };
    case 'close_reader':
      return { ...state, reader_open: false };
    case 'overview':
      return {
        ...state,
        view: 'map',
        depth: 0,
        branch_filter: 'all',
        topic_filter: 'all',
        path_id: '',
        selected: null,
        reader_open: false,
      };
    case 'open_branch':
      return {
        ...state,
        view: 'map',
        branch_filter: action.id,
        topic_filter: 'all',
        depth: 1,
        reader_open: false,
        selected: null,
        path_id: '',
      };
    case 'open_topic':
      return {
        ...state,
        view: 'map',
        branch_filter: action.branch,
        topic_filter: action.id,
        depth: 2,
        selected: null,
        reader_open: false,
      };
    case 'set_depth':
      return {
        ...state,
        view: 'map',
        depth: action.depth,
        topic_filter: 'all',
        selected: null,
        reader_open: false,
      };
    case 'filter_domain':
      return {
        ...state,
        branch_filter: action.id,
        topic_filter: 'all',
        selected: null,
        reader_open: false,
        view: state.view === 'list' ? 'list' : 'map',
        depth: action.id === 'all' ? state.depth : 1,
      };
    case 'change_view': {
      const selected =
        action.view === 'connections' && !state.selected
          ? 'prepayments'
          : state.selected;
      return {
        ...state,
        view: action.view,
        selected,
        trail:
          selected && selected !== state.selected
            ? visit_concept(state.trail, selected)
            : state.trail,
        reader_open: ['paths', 'compare'].includes(action.view)
          ? false
          : state.reader_open,
      };
    }
    case 'choose_path':
      return {
        ...state,
        path_id: action.id,
        view: 'paths',
        reader_open: false,
      };
    case 'choose_comparison':
      return { ...state, comparison_id: action.id, reader_open: false };
    case 'filter_spreads':
      return { ...state, spread_group: action.id, reader_open: false };
    case 'read_connections':
      return state.selected
        ? {
            ...state,
            reader_open: true,
            reader_section: 'connections',
            view: action.change_view ? 'connections' : state.view,
          }
        : state;
  }
}
