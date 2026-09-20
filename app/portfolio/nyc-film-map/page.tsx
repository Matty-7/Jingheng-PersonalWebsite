import Link from 'next/link';
import { BrandMark } from '@/components/brand_mark';
import { NycFilmMap } from '@/components/nyc_film_map';
import { pageMetadata } from '@/lib/seo';
import 'leaflet/dist/leaflet.css';
import './nyc_film_map.css';

export const metadata = pageMetadata(
  'NYC Film Map | Jingheng Huan',
  'Explore New York filming locations from You’ve Got Mail, Anora and more. Find scenes, source references and walking directions on an interactive map.',
  '/portfolio/nyc-film-map',
);

export default function NycFilmMapPage() {
  return (
    <main className="cinema-page">
      <nav className="cinema-nav" aria-label="Projects navigation">
        <Link href="/" className="brand-link" aria-label="Jingheng Huan home"><BrandMark /></Link>
        <Link href="/#projects">← Projects</Link>
      </nav>
      <header className="cinema-heading">
        <div><p className="cinema-kicker">ON LOCATION / NEW YORK CITY</p><h1>NYC Film <em>Map.</em></h1></div>
        <p>A film, a neighborhood, a place to go.<br />Find the city behind the scene.</p>
      </header>
      <NycFilmMap />
      <footer className="cinema-footnote">
        <p>A growing collection, with a source for every film location. Pins mark approximate venues or public approaches, not camera positions. Scene descriptions may contain spoilers.</p>
        <p>Check current opening hours and admission before visiting. Residential locations are for viewing from the public sidewalk only. Sources reviewed September 20, 2026.</p>
      </footer>
    </main>
  );
}
