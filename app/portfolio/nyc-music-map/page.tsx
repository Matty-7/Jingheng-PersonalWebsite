import Link from 'next/link';
import { BrandMark } from '@/components/brand_mark';
import { NycMusicMap } from '@/components/nyc_music_map';
import { google_maps_embed_key } from '@/lib/google_maps_config';
import { pageMetadata } from '@/lib/seo';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './nyc_music_map.css';

export const metadata = pageMetadata('NYC Music Map | Jingheng Huan', 'Find New York places connected to songs and musicians, explore them on Google Maps and discover the recordings through album artwork, short lyric excerpts and Apple Music previews.', '/portfolio/nyc-music-map');

export default function NycMusicMapPage() {
  return <main className="sound-page">
    <nav className="sound-nav" aria-label="Projects navigation"><Link href="/" className="brand-link" aria-label="Jingheng Huan home"><BrandMark /></Link><span>JINGHENG HUAN / PROJECTS</span><Link href="/#projects">← Projects</Link></nav>
    <header className="sound-heading"><h1>NYC Music <em>Map.</em></h1><p>Explore the city through its songs and musicians.</p></header>
    <NycMusicMap google_maps_key={google_maps_embed_key()} />
    <footer className="sound-footnote"><p>A growing collection of places named in songs and connected to musicians’ lives. Artist connections are labeled separately and linked to their sources. Show all places to explore the collection together, or open a selected place in Google Maps. Street and neighborhood references are labeled with their geographic scope.</p><p>Discover the full recordings on Apple Music. Previews are streamed from Apple and may vary by region. Short excerpts are linked to their sources. Reviewed September 21, 2026.</p><Link href="/portfolio/nyc-film-map">Explore the NYC Film Map <span aria-hidden="true">↗</span></Link></footer>
  </main>;
}
