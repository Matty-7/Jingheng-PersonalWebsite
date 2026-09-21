import { google_place_embed_url, google_place_url } from './google_maps';
import location_data from '@/content/nyc_film_locations.json';

export type FilmScene = {
  film_id: string;
  scene: string;
  source_ids: string[];
  still?: { src: string; thumbnail: string; alt: string; credit: string; source_url: string; image_url: string; width: number; height: number };
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

export const film_catalog = location_data.films;
export const film_sources = location_data.sources;
export const film_locations = location_data.locations as FilmLocation[];

export function locations_for_film(film_id: string) {
  return film_id === 'all' ? film_locations : film_locations.filter(
    (location) => location.scenes.some((scene) => scene.film_id === film_id),
  );
}

export function google_maps_url(location: FilmLocation) {
  const query = location.maps_query ?? `${location.address}, ${location.borough}, New York`;
  return google_place_url(query);
}

export function google_film_embed_url(location: FilmLocation, api_key: string) {
  return google_place_embed_url(location.maps_query ?? `${location.address}, ${location.borough}, New York`, api_key, 16);
}

export function search_locations(film_id: string, query: string) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return locations_for_film(film_id).filter((location) => {
    const films = location.scenes.filter((scene) => film_id === 'all' || scene.film_id === film_id)
      .map((scene) => film_catalog.find((film) => film.id === scene.film_id))
      .map((film) => `${film?.title} ${film?.director} ${film?.year}`);
    const text = [location.name, location.address, location.neighborhood, location.borough, ...films].join(' ').toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
