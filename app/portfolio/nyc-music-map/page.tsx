import Link from 'next/link';
import { BrandMark } from '@/components/brand_mark';
import { NycMusicMap } from '@/components/nyc_music_map';
import { pageMetadata } from '@/lib/seo';
import './nyc_music_map.css';

export const metadata = pageMetadata('NYC Music Map | Jingheng Huan', 'Find New York places named in songs, explore them on Google Maps and discover the recordings through album artwork, short lyric excerpts and Apple Music previews.', '/portfolio/nyc-music-map');

export default function NycMusicMapPage() {
  return <main className="sound-page">
    <nav className="sound-nav" aria-label="Projects navigation"><Link href="/" className="brand-link" aria-label="Jingheng Huan home"><BrandMark /></Link><span>JINGHENG HUAN / PROJECTS</span><Link href="/#projects">← Projects</Link></nav>
    <header className="sound-heading"><h1>NYC Music <em>Map.</em></h1><p>Find the places inside the songs.</p></header>
    <NycMusicMap />
    <footer className="sound-footnote"><p>A growing collection of places named in song titles and lyrics. Google Maps shows one selected place at a time. Street and neighborhood references are labeled with their geographic scope.</p><p>Discover the full recordings on Apple Music. Previews are streamed from Apple and may vary by region. Short excerpts are linked to their sources. Reviewed September 20, 2026.</p><Link href="/portfolio/nyc-film-map">Explore the NYC Film Map <span aria-hidden="true">↗</span></Link></footer>
  </main>;
}
