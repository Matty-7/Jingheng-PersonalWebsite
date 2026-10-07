import {
  film_catalog,
  film_locations,
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
  literary_maps_url,
  type LiteraryEntry,
  type LiteraryWork,
} from './nyc_literary_map.ts';
import {
  music_tracks,
  track_places,
  artist_connection,
  google_music_url,
  type MusicPlace,
  type MusicTrack,
} from './nyc_music_map.ts';
import {
  atlas_labels,
  create_atlas_location,
  type AtlasDetail,
  type AtlasIndexEntry,
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
    name: 'JFK Airport',
    places: [
      'film:twa-flight-center',
      'literature:jfk-airport',
      'music:jfk-airport',
    ],
  },
  {
    name: 'LaGuardia Airport',
    places: [
      'film:laguardia-airport',
      'literature:laguardia-airport',
      'music:laguardia-airport',
    ],
  },
  {
    name: 'Washington Square',
    places: [
      'film:washington-square-arch',
      'film:washington-square-north',
      'film:washington-mews',
      'film:robert-townhouse',
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
      'literature:central-park-pond',
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
      'film:steeplechase-pier',
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
    name: 'Empire State Building',
    places: ['film:empire-state-building', 'literature:empire-state-building'],
  },
  {
    name: 'Riverside',
    places: [
      'film:riverside-garden',
      'film:joe-riverside',
      'film:schinasi-mansion',
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
        relationship: scene.relationship ?? 'Filming location',
        precision:
          scene.precision ?? 'Venue or public approach, not a camera position.',
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
      relationship: passage.relationship ?? 'Place in a passage',
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
  const display_text = normalize_search_text(
    [entry.title, entry.place_name, entry.area].join(' '),
  );
  const search_tokens = normalize_search_text(
    [
      entry.creator,
      atlas_year(entry),
      entry.relationship,
      area?.name,
      entry.medium === 'film' ? entry.location.address : '',
    ].join(' '),
  )
    .split(/\s+/)
    .filter(Boolean);
  return {
    id: entry.id,
    medium: entry.medium,
    title: entry.title,
    place_name: entry.place_name,
    area: entry.area,
    ...(entry.medium === 'film' && entry.work.format === 'series'
      ? { series: true as const }
      : {}),
    place_key: entry.place_key,
    coordinates: (entry.medium === 'film'
      ? entry.location.coordinates
      : entry.medium === 'literature'
        ? entry.passage.coordinates
        : entry.place.coordinates) as [number, number],
    // Queries match whitespace-separated terms independently. Each omitted
    // token (and every substring of it) already exists in a display field.
    search_text: [...new Set(search_tokens)]
      .filter((token) => !display_text.includes(token))
      .join(' '),
  };
});
const entries_by_id = new Map(atlas_entries.map((entry) => [entry.id, entry]));
const index_by_id = new Map(atlas_index.map((entry) => [entry.id, entry]));

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

export function atlas_maps_url(entry: AtlasEntry) {
  if (entry.medium === 'film') return google_maps_url(entry.location);
  if (entry.medium === 'literature') return literary_maps_url(entry.passage);
  return google_music_url(entry.place);
}

export const atlas_location = create_atlas_location(atlas_index);

const sentence_segmenter = new Intl.Segmenter('en', {
  granularity: 'sentence',
});

export function atlas_card_summary(entry: AtlasEntry) {
  const introduction =
    entry.medium === 'film'
      ? entry.scene.scene
      : entry.medium === 'literature'
        ? entry.passage.note
        : (artist_connection(entry.track, entry.place.id)?.note ??
          entry.track.note);
  const sentences: string[] = [];
  for (const { segment } of sentence_segmenter.segment(introduction.trim())) {
    const previous = sentences.at(-1);
    // Sentence segmentation can split names such as O. Henry and St. Nicholas.
    if (
      previous &&
      /\b(?:Mr|Mrs|Ms|Dr|St|Prof|Rev|Jr|Sr|[A-Z])\.$/.test(previous)
    ) {
      sentences[sentences.length - 1] += ` ${segment.trim()}`;
    } else {
      sentences.push(segment.trim());
    }
  }
  const summary = sentences.slice(0, 2).join(' ');
  return summary.length <= 200 ? summary : sentences[0];
}

export function atlas_detail(entry_id: string | null): AtlasDetail | null {
  const entry = entry_id ? entries_by_id.get(entry_id) : undefined;
  if (!entry) return null;
  const related = atlas_connections(entry);
  return {
    entry,
    summary: atlas_card_summary(entry),
    label: atlas_entry_label(entry),
    year: atlas_year(entry),
    credit: entry.medium === 'film' ? screen_credit(entry.work) : entry.creator,
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
