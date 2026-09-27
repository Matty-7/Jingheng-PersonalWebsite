import { google_place_url } from './google_maps.ts';
import location_data from '../content/nyc_film_locations.json' with { type: 'json' };

export type FilmScene = {
  film_id: string;
  scene: string;
  source_ids: string[];
  relationship?: 'Screen setting';
  precision?: string;
  still?: {
    kind?: 'production_still' | 'episode_image' | 'location_photo';
    src: string;
    thumbnail: string;
    alt: string;
    credit: string;
    source_url: string;
    image_url: string;
    width: number;
    height: number;
  };
};

export type FilmLocation = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  borough: string;
  coordinates: [number, number];
  access: string;
  visit_note: string;
  maps_query?: string;
  scenes: FilmScene[];
};

export type ScreenWork = {
  id: string;
  title: string;
  year: number;
  note: string;
} & (
  | { format?: 'film'; director: string }
  | { format: 'series'; creators: string; end_year: number | null }
);

export function screen_kind(work: ScreenWork) {
  return work.format === 'series' ? 'TV series' : 'Film';
}

export function screen_creator(work: ScreenWork) {
  return work.format === 'series' ? work.creators : work.director;
}

export function screen_credit(work: ScreenWork) {
  return work.format === 'series'
    ? `Created by ${work.creators}`
    : work.director;
}

export function screen_year(work: ScreenWork) {
  return work.format === 'series'
    ? `${work.year}–${work.end_year ?? 'present'}`
    : String(work.year);
}

export const film_catalog = location_data.films as ScreenWork[];
export const film_sources = location_data.sources;
export const film_locations = location_data.locations as FilmLocation[];

export function google_maps_url(location: FilmLocation) {
  const query =
    location.maps_query ?? `${location.address}, ${location.borough}, New York`;
  return google_place_url(query);
}
