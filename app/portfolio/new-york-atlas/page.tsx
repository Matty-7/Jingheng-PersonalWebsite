import { NewYorkAtlas } from '@/components/new_york_atlas';
import { pageMetadata } from '@/lib/seo';
import {
  atlas_location,
  atlas_index,
  atlas_detail,
} from '@/lib/new_york_atlas';
import { read_map_selection, type MapSearchParams } from '@/lib/map_location';
import './new_york_atlas.css';

export const metadata = pageMetadata(
  'New York Atlas | Jingheng Huan',
  'Explore New York through film, television, literature and music. Discover filming locations, original passages and song previews connected by the places they share.',
  '/portfolio/new-york-atlas',
);

export default async function NewYorkAtlasPage({
  searchParams,
}: {
  searchParams: Promise<MapSearchParams>;
}) {
  const initial_selection = read_map_selection(
    atlas_location,
    await searchParams,
  );
  return (
    <main className="atlas-page">
      <NewYorkAtlas
        index={atlas_index}
        initial_detail={atlas_detail(initial_selection.entry_id)}
        initial_selection={initial_selection}
      />
    </main>
  );
}
