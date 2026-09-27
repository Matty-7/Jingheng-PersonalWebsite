import { google_place_url } from './google_maps.ts';
import catalog from '../content/nyc_music_map.json' with { type: 'json' };

export type MusicConnection = {
  place_id: string;
  kind: string;
  note: string;
  source_url: string;
  source_label: string;
};
export type MusicTrack = (typeof catalog.tracks)[number] & {
  connections?: MusicConnection[];
};
export type MusicPlace = (typeof catalog.places)[number];
export const music_tracks: MusicTrack[] = catalog.tracks;
export const music_places = catalog.places;

export function track_places(track: MusicTrack): MusicPlace[] {
  return track.place_ids.map((id) =>
    music_places.find((place) => place.id === id)!,
  );
}

export function artist_connection(track: MusicTrack, place_id: string) {
  return track.connections?.find(
    (connection) => connection.place_id === place_id,
  );
}

export function google_music_url(place: MusicPlace): string {
  return google_place_url(place.coordinates.join(','));
}
