import Link from 'next/link';
import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand_mark';
import { MortgageMap } from '@/components/mortgage_map';
import { pageMetadata } from '@/lib/seo';
import 'katex/dist/katex.min.css';
import './mortgage_map.css';
import { render_mortgage_math } from '@/lib/mortgage_math';

export const metadata: Metadata = pageMetadata(
  'Mortgage Map | Jingheng Huan',
  'Explore mortgage cash flows, interest rates and structured credit in one connected Mortgage Map, with formulas, comparisons, reading paths and public sources.',
  '/portfolio/mortgage-map',
);

export default function MortgageMapPage() {
  return (
    <main className="map-page" id="map-top">
      <nav className="map-nav" aria-label="Projects navigation">
        <Link href="/" className="brand-link" aria-label="Jingheng Huan home">
          <BrandMark />
        </Link>
        <Link href="/#projects">← Projects</Link>
      </nav>
      <header className="map-header">
        <h1>
          Mortgage <em>Map.</em>
        </h1>
        <p>Mortgage cash flows, interest rates and structured credit.</p>
      </header>
      <MortgageMap formulas={render_mortgage_math()} />
      <p className="map-scope">
        An evolving guide to mortgages and MBS, connecting interest rates,
        commercial property, funding and credit within one map. Original
        explanations link to public references. Connections distinguish mechanisms, definitions,
        measurements and comparisons; examples are illustrative.
      </p>
    </main>
  );
}
