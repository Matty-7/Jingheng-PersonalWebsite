import type { MapLocationCodec } from './map_location';
import type { AtlasEntry } from './new_york_atlas';
import type { MusicConnection } from './nyc_music_map';
import { normalize_search_text } from './search_text.ts';

export type AtlasMedium = 'film' | 'literature' | 'music';
export type AtlasFilter = AtlasMedium | 'all';
export type AtlasSelection = {
  medium: AtlasFilter;
  query: string;
  entry_id: string | null;
};
export type AtlasIndexEntry = {
  id: string;
  medium: AtlasMedium;
  title: string;
  place_name: string;
  area: string;
  label: string;
  search_text: string;
};
export type AtlasDetail = {
  entry: AtlasEntry;
  label: string;
  year: string | number;
  credit: string;
  map_url: string | null;
  maps_url: string;
  sources: { id: string; label: string; url: string }[];
  connection: MusicConnection | null;
  related: { label: string; area: boolean; entries: AtlasIndexEntry[] };
};

export const atlas_labels: Record<AtlasFilter, string> = {
  all: 'All',
  film: 'Film & TV',
  literature: 'Literature',
  music: 'Music',
};

export function search_atlas_index(
  index: AtlasIndexEntry[],
  medium: AtlasFilter,
  query: string,
) {
  const terms = normalize_search_text(query)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return index.filter(
    (entry) =>
      (medium === 'all' || entry.medium === medium) &&
      terms.every((term) => entry.search_text.includes(term)),
  );
}

export function create_atlas_location(
  index: AtlasIndexEntry[],
): MapLocationCodec<AtlasSelection> {
  return {
    initial_state: { medium: 'all', query: '', entry_id: index[0]?.id ?? null },
    keys: ['medium', 'q', 'entry'],
    read(params) {
      const candidate = params.get('medium');
      const medium =
        candidate === 'film' ||
        candidate === 'literature' ||
        candidate === 'music'
          ? candidate
          : 'all';
      const query = params.get('q') ?? '';
      const results = search_atlas_index(index, medium, query);
      const entry_id =
        results.find((entry) => entry.id === params.get('entry'))?.id ??
        results[0]?.id ??
        null;
      return { medium, query, entry_id };
    },
    write(state) {
      return {
        medium: state.medium === 'all' ? '' : state.medium,
        q: state.query,
        entry: state.entry_id ?? '',
      };
    },
  };
}
