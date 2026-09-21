import type { MapLocationCodec } from './map_location';
import { music_tracks, search_music } from './nyc_music_map.ts';

type MusicSelection = {
  track_id: string | null;
  place_id: string;
  query: string;
  overview: boolean;
};

export const music_location: MapLocationCodec<MusicSelection> = {
  initial_state: {
    track_id: music_tracks[0].id,
    place_id: music_tracks[0].place_ids[0],
    query: '',
    overview: false,
  },
  keys: ['track', 'place', 'q', 'view'],
  read(params) {
    const query = params.get('q') ?? '';
    const overview = params.get('view') === 'all';
    const results = search_music(query);
    const candidates = overview && !results.length ? music_tracks : results;
    const track =
      candidates.find((item) => item.id === params.get('track')) ??
      candidates[0];
    const requested_place = params.get('place') ?? '';
    return {
      track_id: track?.id ?? null,
      place_id: track?.place_ids.includes(requested_place)
        ? requested_place
        : (track?.place_ids[0] ?? ''),
      query,
      overview,
    };
  },
  write(state) {
    const track = music_tracks.find((item) => item.id === state.track_id);
    return {
      track:
        state.track_id === music_tracks[0].id ? '' : (state.track_id ?? ''),
      place: state.place_id === track?.place_ids[0] ? '' : state.place_id,
      q: state.query,
      view: state.overview ? 'all' : '',
    };
  },
};
