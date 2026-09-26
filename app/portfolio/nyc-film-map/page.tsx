import Link from 'next/link';
import { BrandMark } from '@/components/brand_mark';
import { NycFilmMap } from '@/components/nyc_film_map';
import { film_location } from '@/lib/nyc_film_location';
import { google_maps_embed_key } from '@/lib/google_maps_config';
import { pageMetadata } from '@/lib/seo';
import './nyc_film_map.css';

export const metadata = pageMetadata(
  'NYC Film & TV Map | Jingheng Huan',
  'Explore New York through films and TV series. Find real filming locations, matching scene images and links to each place on Google Maps.',
  '/portfolio/nyc-film-map',
);

export default async function NycFilmMapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (value !== undefined)
      params.set(key, Array.isArray(value) ? value[0] : value);
  }
  const initial_selection = film_location.read(params);
  return (
    <main className="cinema-page">
      <nav className="cinema-nav" aria-label="Projects navigation">
        <Link href="/" className="brand-link" aria-label="Jingheng Huan home">
          <BrandMark />
        </Link>
        <span>JINGHENG HUAN / PROJECTS</span>
        <Link href="/portfolio/new-york-atlas">← New York Atlas</Link>
      </nav>
      <header className="cinema-heading">
        <h1>
          NYC Film &amp; TV <em>Map.</em>
        </h1>
        <p>The city, on screen.</p>
      </header>
      <NycFilmMap
        google_maps_key={google_maps_embed_key()}
        initial_selection={initial_selection}
      />
      <footer className="cinema-footnote">
        <p>
          A growing collection of sourced filming locations. Pins mark venues or
          public approaches, not camera positions. Scene images are shown with
          source credits. Scene descriptions may contain spoilers.
        </p>
        <p>
          Check current opening hours and admission before visiting. Residential
          locations are for viewing from the public sidewalk only. Latest
          additions reviewed September 26, 2026.
        </p>
      </footer>
    </main>
  );
}
