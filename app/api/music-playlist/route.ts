import { playlist_csv } from '@/lib/music_playlist';
import { music_tracks, music_places } from '@/lib/nyc_music_map';

export function GET() {
  return new Response(playlist_csv(music_tracks, music_places), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="nyc_music_map.csv"',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
