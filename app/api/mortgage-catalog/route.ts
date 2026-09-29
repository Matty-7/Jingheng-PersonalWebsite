import { mortgage_catalog_data } from '@/lib/mortgage_catalog_data';

export function GET() {
  return Response.json(mortgage_catalog_data, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
