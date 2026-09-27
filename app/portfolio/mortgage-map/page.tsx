import Link from 'next/link';
import { Sprout } from 'lucide-react';
import type { Metadata } from 'next';
import { MortgageMap } from '@/components/mortgage_map';
import { pageMetadata } from '@/lib/seo';
import { render_mortgage_math } from '@/lib/mortgage_math';
import 'katex/dist/katex.min.css';
import './mortgage_map.css';

export const metadata: Metadata = pageMetadata(
  'Mortgage Map | Jingheng Huan',
  'Learn mortgage cash flows, interest rates and structured credit through a focused learning tree, interactive examples and public sources.',
  '/portfolio/mortgage-map',
);

export default function MortgageMapPage() {
  return (
    <main className="mortgage-learning-page" id="map-top">
      <MortgageMap
        formulas={render_mortgage_math()}
        home_link={
          <Link href="/#projects" aria-label="Back to projects">
            <Sprout size={28} aria-hidden="true" />
          </Link>
        }
      />
    </main>
  );
}
