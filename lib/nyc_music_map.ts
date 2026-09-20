import catalog from '../content/nyc_music_map.json';

export type MusicTrack = (typeof catalog.tracks)[number];
export type MusicPlace = (typeof catalog.places)[number];
export const music_tracks = catalog.tracks;
export const music_places = catalog.places;

export function track_places(track: MusicTrack): MusicPlace[] {
  return track.place_ids.map((id) => music_places.find((place) => place.id === id)!);
}

export function search_music(query: string): MusicTrack[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return music_tracks.filter((track) => {
    const text = [track.title, track.artist, track.album, track.genre, ...track_places(track).flatMap((place) => [place.name, place.area])].join(' ').toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export function google_music_url(place: MusicPlace): string {
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: place.map_query })}`;
}

export function google_music_embed_url(place: MusicPlace): string {
  return `https://www.google.com/maps?${new URLSearchParams({ q: place.map_query, output: 'embed', z: place.precision === 'Borough' ? '11' : place.precision === 'Neighborhood' ? '14' : '16' })}`;
}

export function preview_time(seconds: number): string {
  const safe_seconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${Math.floor(safe_seconds / 60)}:${String(Math.floor(safe_seconds % 60)).padStart(2, '0')}`;
}
