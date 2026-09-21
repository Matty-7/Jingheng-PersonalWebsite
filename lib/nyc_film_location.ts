import type { MapLocationCodec } from './map_location';
import { film_catalog, search_locations } from './nyc_film_map.ts';

type FilmSelection = {
  film_id: string;
  selected_id: string | null;
  query: string;
};

export const film_location: MapLocationCodec<FilmSelection> = {
  initial_state: { film_id: 'all', selected_id: null, query: '' },
  keys: ['film', 'place', 'q'],
  read(params) {
    const film_id = film_catalog.some((film) => film.id === params.get('film'))
      ? params.get('film')!
      : 'all';
    const query = params.get('q') ?? '';
    const selected_id =
      search_locations(film_id, query).find(
        (place) => place.id === params.get('place'),
      )?.id ?? null;
    return { film_id, selected_id, query };
  },
  write(state) {
    return {
      film: state.film_id === 'all' ? '' : state.film_id,
      place: state.selected_id ?? '',
      q: state.query,
    };
  },
};
