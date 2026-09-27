import { permanentRedirect } from 'next/navigation';
import { atlas_legacy_url } from '@/lib/atlas_legacy';
import type { MapSearchParams } from '@/lib/map_location';

export default async function LegacyMapPage({
  searchParams,
}: {
  searchParams: Promise<MapSearchParams>;
}) {
  permanentRedirect(atlas_legacy_url('music', await searchParams));
}
