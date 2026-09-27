import Link from 'next/link';
import { BrandMark } from '@/components/brand_mark';
import { NewYorkAtlas } from '@/components/new_york_atlas';
import { google_maps_embed_key } from '@/lib/google_maps_config';
import { pageMetadata } from '@/lib/seo';
import {
  atlas_location,
  atlas_index,
  atlas_counts,
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
      <nav className="atlas-nav" aria-label="Projects navigation">
        <Link
          prefetch={false}
          href="/"
          className="brand-link"
          aria-label="Jingheng Huan home"
        >
          <BrandMark />
        </Link>
        <Link prefetch={false} href="/#projects">
          ← Projects
        </Link>
      </nav>
      <header className="atlas-heading">
        <h1>
          New York <em>Atlas.</em>
        </h1>
        <p>Film &amp; TV, literature, and music.</p>
      </header>
      <NewYorkAtlas
        index={atlas_index}
        counts={atlas_counts}
        initial_detail={atlas_detail(
          initial_selection.entry_id,
          google_maps_embed_key(),
        )}
        initial_selection={initial_selection}
      />
      <footer className="atlas-footer">
        <details>
          <summary>About this atlas</summary>
          <p>
            A collection of sourced connections between works and places.
            Filming locations, literary settings and musicians’ lives are
            identified separately. Area references do not identify an exact
            building.
          </p>
          <p>
            Film and TV scenes may contain spoilers. Check access before
            visiting; view residential locations from the public sidewalk.
          </p>
        </details>
      </footer>
    </main>
  );
}
