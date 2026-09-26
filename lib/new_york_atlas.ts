import {
  film_catalog,
  film_locations,
  google_film_embed_url,
  google_maps_url,
  type FilmLocation,
  type FilmScene,
} from './nyc_film_map.ts';
import {
  literary_entries,
  literary_works,
  literary_embed_url,
  literary_maps_url,
  type LiteraryEntry,
  type LiteraryWork,
} from './nyc_literary_map.ts';
import {
  music_tracks,
  track_places,
  artist_connection,
  google_music_embed_url,
  google_music_url,
  type MusicPlace,
  type MusicTrack,
} from './nyc_music_map.ts';
import type { MapLocationCodec } from './map_location';

export type AtlasMedium = 'film' | 'literature' | 'music';
export type AtlasFilter = AtlasMedium | 'all';
type AtlasBase = {
  id: string;
  place_key: string;
  title: string;
  creator: string;
  year: number | null;
  place_name: string;
  area: string;
  relationship: string;
  precision: string;
  visit_note: string;
  collection_url: string;
};
export type AtlasEntry = AtlasBase &
  (
    | { medium: 'film'; location: FilmLocation; scene: FilmScene }
    | { medium: 'literature'; passage: LiteraryEntry; work: LiteraryWork }
    | { medium: 'music'; track: MusicTrack; place: MusicPlace }
  );

// These are reviewed area associations, not replacement coordinates or merged places.
export const atlas_areas = [
  {
    name: 'Washington Square',
    places: [
      'film:washington-square-arch',
      'film:washington-square-north',
      'film:washington-mews',
      'literature:washington-square',
      'music:washington-square',
    ],
  },
  {
    name: 'Central Park',
    places: [
      'film:boathouse',
      'film:central-park-lake',
      'film:central-park-zoo',
      'film:central-park-mall',
      'literature:central-park',
      'literature:central-park-zoo',
      'music:central-park',
      'music:central-park-west',
      'music:central-park-north',
    ],
  },
  {
    name: 'Queensboro Bridge',
    places: [
      'film:sutton-square',
      'literature:queensboro-bridge',
      'music:queensboro-bridge',
    ],
  },
  {
    name: 'Coney Island',
    places: [
      'film:coney-boardwalk',
      'literature:coney-island',
      'music:coney-island',
      'music:mermaid-avenue',
      'music:steeplechase-park',
    ],
  },
  {
    name: 'Grand Central',
    places: [
      'film:grand-central',
      'literature:grand-central',
      'music:grand-central',
    ],
  },
  { name: 'The Plaza', places: ['film:plaza', 'literature:plaza-hotel'] },
  {
    name: 'Riverside',
    places: [
      'film:riverside-garden',
      'film:joe-riverside',
      'literature:riverside-drive',
      'music:riverside',
    ],
  },
  {
    name: 'Lenox Avenue',
    places: ['literature:lenox-avenue', 'music:lenox-avenue'],
  },
  { name: 'Harlem', places: ['literature:harlem', 'music:harlem'] },
  { name: 'Broadway', places: ['literature:broadway', 'music:broadway'] },
  {
    name: 'Fifth Avenue',
    places: ['literature:fifth-avenue', 'music:fifth-avenue'],
  },
  {
    name: 'Grand Street',
    places: ['literature:grand-street', 'music:grand-street'],
  },
  {
    name: 'Canal Street',
    places: ['literature:canal-street', 'music:canal-street'],
  },
  {
    name: 'East Broadway',
    places: ['literature:east-broadway', 'music:east-broadway'],
  },
];

export const atlas_entries: AtlasEntry[] = [
  ...film_locations.flatMap((location) =>
    location.scenes.map((scene): AtlasEntry => {
      const film = film_catalog.find((item) => item.id === scene.film_id)!;
      return {
        id: `film:${location.id}:${film.id}`,
        medium: 'film',
        place_key: `film:${location.id}`,
        title: film.title,
        creator: film.director,
        year: film.year,
        place_name: location.name,
        area: `${location.neighborhood}, ${location.borough}`,
        relationship: 'Filming location',
        precision: 'Venue or public approach, not a camera position.',
        visit_note: location.visit_note,
        collection_url: `/portfolio/nyc-film-map?film=${film.id}&place=${location.id}`,
        location,
        scene,
      };
    }),
  ),
  ...literary_entries.map((passage): AtlasEntry => {
    const work = literary_works.find((item) => item.id === passage.work_id)!;
    return {
      id: `literature:${passage.id}`,
      medium: 'literature',
      place_key: `literature:${passage.place_id}`,
      title: work.title,
      creator: work.author,
      year: work.year,
      place_name: passage.place,
      area: passage.area,
      relationship: 'Place in a passage',
      precision: passage.precision,
      visit_note: passage.visit_note,
      collection_url: `/portfolio/nyc-literary-map?work=${work.id}&passage=${passage.id}`,
      passage,
      work,
    };
  }),
  ...music_tracks.flatMap((track) =>
    track_places(track).map((place): AtlasEntry => {
      const connection = artist_connection(track, place.id);
      return {
        id: `music:${track.id}:${place.id}`,
        medium: 'music',
        place_key: `music:${place.id}`,
        title: track.title,
        creator: track.artist,
        year: track.year,
        place_name: place.name,
        area: place.area,
        relationship: connection
          ? `Artist connection · ${connection.kind}`
          : track.relation === 'Title'
            ? 'Named in the title'
            : track.relation === 'Lyrics'
              ? 'Named in the lyrics'
              : 'Named in the title and lyrics',
        precision: place.precision,
        visit_note: place.note,
        collection_url: `/portfolio/nyc-music-map?track=${track.id}&place=${place.id}`,
        track,
        place,
      };
    }),
  ),
];

export const atlas_counts = {
  film: film_catalog.length,
  literature: literary_works.length,
  music: music_tracks.length,
};
export const atlas_labels: Record<AtlasFilter, string> = {
  all: 'All',
  film: 'Film',
  literature: 'Literature',
  music: 'Music',
};

function search_text(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[’‘]/g, "'")
    .toLocaleLowerCase();
}

export function search_atlas(medium: AtlasFilter, query: string) {
  const terms = search_text(query).trim().split(/\s+/).filter(Boolean);
  return atlas_entries.filter((entry) => {
    if (medium !== 'all' && entry.medium !== medium) return false;
    const area = atlas_areas.find((item) =>
      item.places.includes(entry.place_key),
    );
    const text = search_text(
      [
        entry.title,
        entry.creator,
        entry.year,
        entry.place_name,
        entry.area,
        entry.relationship,
        area?.name,
        entry.medium === 'film' ? entry.location.address : '',
      ].join(' '),
    );
    return terms.every((term) => text.includes(term));
  });
}

export function atlas_connections(entry: AtlasEntry) {
  const area = atlas_areas.find((item) =>
    item.places.includes(entry.place_key),
  );
  return {
    label: area ? `Around ${area.name}` : `More at ${entry.place_name}`,
    area: !!area,
    entries: atlas_entries.filter(
      (other) =>
        other.id !== entry.id &&
        (area
          ? area.places.includes(other.place_key)
          : other.place_key === entry.place_key),
    ),
  };
}

export function atlas_embed_url(entry: AtlasEntry, api_key: string) {
  if (entry.medium === 'film')
    return google_film_embed_url(entry.location, api_key);
  if (entry.medium === 'literature')
    return literary_embed_url(entry.passage, api_key);
  return google_music_embed_url(entry.place, api_key);
}

export function atlas_maps_url(entry: AtlasEntry) {
  if (entry.medium === 'film') return google_maps_url(entry.location);
  if (entry.medium === 'literature') return literary_maps_url(entry.passage);
  return google_music_url(entry.place);
}

type AtlasSelection = {
  medium: AtlasFilter;
  query: string;
  entry_id: string | null;
};
export const atlas_location: MapLocationCodec<AtlasSelection> = {
  initial_state: { medium: 'all', query: '', entry_id: atlas_entries[0].id },
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
    const results = search_atlas(medium, query);
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
