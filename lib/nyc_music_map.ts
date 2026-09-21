import { google_place_embed_url, google_place_url } from './google_maps';
import catalog from '../content/nyc_music_map.json';

export type MusicConnection = { place_id: string; kind: string; note: string; source_url: string; source_label: string };
export type MusicTrack = (typeof catalog.tracks)[number] & { connections?: MusicConnection[] };
export type MusicPlace = (typeof catalog.places)[number];
export const music_tracks: MusicTrack[] = catalog.tracks;
export const music_places = catalog.places;

export function track_places(track: MusicTrack): MusicPlace[] {
  return track.place_ids.map((id) => music_places.find((place) => place.id === id)!);
}

export function artist_connection(track: MusicTrack, place_id: string) {
  return track.connections?.find((connection) => connection.place_id === place_id);
}

export function search_music(query: string): MusicTrack[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return music_tracks.filter((track) => {
    const text = [track.title, track.artist, track.album, track.genre, ...track_places(track).flatMap((place) => [place.name, place.area])].join(' ').toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export function google_music_url(place: MusicPlace): string {
  return google_place_url(place.coordinates.join(','));
}

export function google_music_embed_url(place: MusicPlace, api_key: string): string | null {
  const url = google_place_embed_url(place.plus_code, api_key, place.precision === 'City' ? 10 : place.precision === 'Borough' ? 11 : place.precision === 'Area' ? 13 : place.precision === 'Neighborhood' ? 14 : 16);
  return url ? `${url}&center=${encodeURIComponent(place.coordinates.join(','))}` : null;
}

export function preview_time(seconds: number): string {
  const safe_seconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${Math.floor(safe_seconds / 60)}:${String(Math.floor(safe_seconds % 60)).padStart(2, '0')}`;
}
