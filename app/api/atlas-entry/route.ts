import { atlas_detail } from '@/lib/new_york_atlas';

export function GET(request: Request) {
  const entry_id = new URL(request.url).searchParams.get('entry');
  const detail = atlas_detail(entry_id);
  return Response.json(detail ?? { error: 'Atlas entry not found' }, {
    status: detail ? 200 : 404,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
