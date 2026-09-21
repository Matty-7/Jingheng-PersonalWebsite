import Link from 'next/link';
import { BrandMark } from '@/components/brand_mark';
import { NycFilmMap } from '@/components/nyc_film_map';
import { google_maps_embed_key } from '@/lib/google_maps_config';
import { pageMetadata } from '@/lib/seo';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './nyc_film_map.css';

export const metadata = pageMetadata(
  'NYC Film Map | Jingheng Huan',
  'Explore New York through Manhattan, You’ve Got Mail, Anora and more. Find real filming locations, matching movie frames and links to each place on Google Maps.',
  '/portfolio/nyc-film-map',
);

export default function NycFilmMapPage() {
  return (
    <main className="cinema-page">
      <nav className="cinema-nav" aria-label="Projects navigation">
        <Link href="/" className="brand-link" aria-label="Jingheng Huan home"><BrandMark /></Link>
        <span>JINGHENG HUAN / PROJECTS</span>
        <Link href="/#projects">← Projects</Link>
      </nav>
      <header className="cinema-heading">
        <h1>NYC Film <em>Map.</em></h1>
        <p>The city, as seen in the movies.</p>
      </header>
      <NycFilmMap google_maps_key={google_maps_embed_key()} />
      <footer className="cinema-footnote">
        <p>A growing collection of sourced filming locations. Pins mark venues or public approaches, not camera positions. Film frames are shown with source credits. Scene descriptions may contain spoilers.</p>
        <p>Check current opening hours and admission before visiting. Residential locations are for viewing from the public sidewalk only. Sources reviewed September 20, 2026.</p>
      </footer>
    </main>
  );
}
