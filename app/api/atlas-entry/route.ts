import { atlas_detail } from '@/lib/new_york_atlas';
import { google_maps_embed_key } from '@/lib/google_maps_config';

export function GET(request: Request) {
  const entry_id = new URL(request.url).searchParams.get('entry');
  const detail = atlas_detail(entry_id, google_maps_embed_key());
  return Response.json(detail ?? { error: 'Atlas entry not found' }, {
    status: detail ? 200 : 404,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
