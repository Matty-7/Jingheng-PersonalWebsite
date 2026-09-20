import location_data from '@/content/nyc_film_locations.json';

export type FilmScene = {
  film_id: string;
  scene: string;
  source_ids: string[];
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

export function directions_url(location: FilmLocation) {
  const destination = `${location.name}, ${location.address}, New York`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking`;
}
