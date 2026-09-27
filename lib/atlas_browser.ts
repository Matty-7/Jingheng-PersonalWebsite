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
  place_key: string;
  coordinates: [number, number];
};
export type AtlasDetail = {
  entry: AtlasEntry;
  summary: string;
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

export function atlas_card_artwork(detail: AtlasDetail | null) {
  const entry = detail?.entry;
  if (entry?.medium === 'film') {
    const still = entry.scene.still;
    return still ? { ...still, src: still.thumbnail } : null;
  }
  if (entry?.medium === 'literature')
    return entry.work.cover
      ? { ...entry.work.cover, width: 300, height: 450 }
      : null;
  if (entry?.medium === 'music')
    return {
      src: entry.track.artwork_url,
      alt: `${entry.track.album} cover`,
      width: 300,
      height: 300,
    };
  return null;
}

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
    initial_state: { medium: 'all', query: '', entry_id: null },
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
        results.find((entry) => entry.id === params.get('entry'))?.id ?? null;
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
