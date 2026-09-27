import {
  film_catalog,
  film_locations,
  google_film_embed_url,
  google_maps_url,
  screen_creator,
  screen_credit,
  film_sources,
  screen_kind,
  screen_year,
  type ScreenWork,
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
import {
  atlas_labels,
  create_atlas_location,
  search_atlas_index,
  type AtlasDetail,
  type AtlasFilter,
  type AtlasIndexEntry,
} from './atlas_browser.ts';
export { atlas_labels } from './atlas_browser.ts';
export type {
  AtlasMedium,
  AtlasFilter,
  AtlasSelection,
} from './atlas_browser.ts';
import { normalize_search_text } from './search_text.ts';

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
    | {
        medium: 'film';
        location: FilmLocation;
        scene: FilmScene;
        work: ScreenWork;
      }
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
        creator: screen_creator(film),
        year: film.year,
        place_name: location.name,
        area: `${location.neighborhood}, ${location.borough}`,
        relationship: 'Filming location',
        precision: 'Venue or public approach, not a camera position.',
        visit_note: location.visit_note,
        collection_url: `/portfolio/nyc-film-map?film=${film.id}&place=${location.id}`,
        location,
        scene,
        work: film,
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
export function atlas_entry_label(entry: AtlasEntry) {
  return entry.medium === 'film'
    ? screen_kind(entry.work)
    : atlas_labels[entry.medium];
}

export function atlas_year(entry: AtlasEntry) {
  return entry.medium === 'film'
    ? screen_year(entry.work)
    : (entry.year ?? 'Year unverified');
}

// Only the search/list fields cross the initial browser boundary. Source prose,
// artwork metadata and complete catalogs remain on the server.
export const atlas_index: AtlasIndexEntry[] = atlas_entries.map((entry) => {
  const area = atlas_areas.find((item) =>
    item.places.includes(entry.place_key),
  );
  return {
    id: entry.id,
    medium: entry.medium,
    title: entry.title,
    place_name: entry.place_name,
    area: entry.area,
    label: atlas_entry_label(entry),
    search_text: normalize_search_text(
      [
        entry.title,
        entry.creator,
        atlas_year(entry),
        entry.place_name,
        entry.area,
        entry.relationship,
        area?.name,
        entry.medium === 'film' ? entry.location.address : '',
      ].join(' '),
    ),
  };
});
const entries_by_id = new Map(atlas_entries.map((entry) => [entry.id, entry]));
const index_by_id = new Map(atlas_index.map((entry) => [entry.id, entry]));

export function search_atlas(medium: AtlasFilter, query: string) {
  return search_atlas_index(atlas_index, medium, query).map((entry) =>
    entries_by_id.get(entry.id)!,
  );
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

export const atlas_location = create_atlas_location(atlas_index);

export function atlas_detail(
  entry_id: string | null,
  api_key: string,
): AtlasDetail | null {
  const entry = entry_id ? entries_by_id.get(entry_id) : undefined;
  if (!entry) return null;
  const related = atlas_connections(entry);
  return {
    entry,
    label: atlas_entry_label(entry),
    year: atlas_year(entry),
    credit: entry.medium === 'film' ? screen_credit(entry.work) : entry.creator,
    map_url: atlas_embed_url(entry, api_key),
    maps_url: atlas_maps_url(entry),
    sources:
      entry.medium === 'film'
        ? entry.scene.source_ids.flatMap((id) => {
            const source = film_sources.find((item) => item.id === id);
            return source ? [source] : [];
          })
        : [],
    connection:
      entry.medium === 'music'
        ? (artist_connection(entry.track, entry.place.id) ?? null)
        : null,
    related: {
      ...related,
      entries: related.entries.map((item) => index_by_id.get(item.id)!),
    },
  };
}
