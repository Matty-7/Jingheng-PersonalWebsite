import type { MapLocationCodec } from './map_location';
import {
  literary_entries,
  literary_works,
  search_literary_entries,
} from './nyc_literary_map.ts';

type LiterarySelection = {
  work_id: string;
  selected_id: string;
  query: string;
};

export const literary_location: MapLocationCodec<LiterarySelection> = {
  initial_state: {
    work_id: 'all',
    selected_id: literary_entries[0].id,
    query: '',
  },
  keys: ['work', 'passage', 'q'],
  read(params) {
    const work_id = literary_works.some(
      (work) => work.id === params.get('work'),
    )
      ? params.get('work')!
      : 'all';
    const query = params.get('q') ?? '';
    const matches = search_literary_entries(work_id, query);
    const selected_id =
      (
        matches.find((entry) => entry.id === params.get('passage')) ??
        matches[0]
      )?.id ?? '';
    return { work_id, selected_id, query };
  },
  write(state) {
    return {
      work: state.work_id === 'all' ? '' : state.work_id,
      passage: state.selected_id,
      q: state.query,
    };
  },
};
