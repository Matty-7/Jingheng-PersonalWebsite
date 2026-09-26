import Link from 'next/link';
import { BrandMark } from '@/components/brand_mark';
import { NycLiteraryMap } from '@/components/nyc_literary_map';
import { google_maps_embed_key } from '@/lib/google_maps_config';
import { pageMetadata } from '@/lib/seo';
import './nyc_literary_map.css';

export const metadata = pageMetadata('NYC Literary Map | Jingheng Huan', 'Explore New York through books and magazines, with original passages, real covers, source references and Google Maps.', '/portfolio/nyc-literary-map');

export default function NycLiteraryMapPage() {
  return <main className="literary-page">
    <nav className="literary-nav" aria-label="Projects navigation"><Link href="/" className="brand-link" aria-label="Jingheng Huan home"><BrandMark /></Link><div><Link href="/portfolio/nyc-film-map">Film Map</Link><Link href="/portfolio/new-york-atlas">← New York Atlas</Link></div></nav>
    <header className="literary-heading"><div><p>NEW YORK, IN PRINT</p><h1>NYC Literary <em>Map.</em></h1></div><p>A place in the city. A passage on the page.<br /> Read New York through the writers who described it.</p></header>
    <NycLiteraryMap google_maps_key={google_maps_embed_key()} />
    <footer className="literary-footnote"><p>Each place is connected to a passage, with its source alongside. Locations may identify a neighborhood, a historical crossing or a present-day institution; the notes explain which.</p><p>Public-domain texts appear in longer excerpts. Copyrighted articles appear as brief quotations with links to the original. Covers identify the editions or magazine issues noted. Sources checked September 20, 2026.</p></footer>
  </main>;
}
