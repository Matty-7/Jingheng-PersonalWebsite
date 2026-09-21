import type { MusicTrack, MusicPlace } from './nyc_music_map';

function csv_cell(value: string): string {
  const safe_value = /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe_value.replaceAll('"', '""')}"`;
}

export function playlist_csv(tracks: MusicTrack[], places: MusicPlace[]): string {
  const place_names = new Map(places.map((place) => [place.id, place.name]));
  const rows = [['Title', 'Artist', 'Album', 'Places', 'Apple Music URL'], ...tracks.map((track) => [
    track.title, track.artist, track.album, track.place_ids.map((id) => place_names.get(id) ?? id).join('; '), track.apple_music_url,
  ])];
  return '\uFEFF' + rows.map((row) => row.map(csv_cell).join(',')).join('\r\n') + '\r\n';
}

export function playlist_text(tracks: MusicTrack[]): string {
  return tracks.map((track) => `${track.artist} - ${track.title}`).join('\n');
}
