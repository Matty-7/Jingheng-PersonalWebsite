import Link from 'next/link';
import { Sprout } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { MortgageMap } from '@/components/mortgage_map';
import { pageMetadata } from '@/lib/seo';
import { mortgage_lesson } from '@/lib/mortgage_lesson';
import {
  learning_navigation,
  learning_routes,
  position_cookie,
  read_position,
  select_lesson,
} from '@/lib/mortgage_learning';
import 'katex/dist/katex.min.css';
import './mortgage_map.css';

export const metadata: Metadata = pageMetadata(
  'Mortgage Map | Jingheng Huan',
  'Learn mortgage cash flows, interest rates and structured credit through a focused learning tree, interactive examples and public sources.',
  '/portfolio/mortgage-map',
);

export default async function MortgageMapPage({
  searchParams,
}: {
  searchParams: Promise<{ concept?: string | string[] }>;
}) {
  const params = await searchParams;
  const position = read_position((await cookies()).get(position_cookie)?.value);
  const initial_lesson =
    typeof params.concept === 'string'
      ? select_lesson(position, params.concept)
      : position;
  const legacy_hash_guard = `try{const id=new URLSearchParams(location.hash.slice(1)).get('concept');if(id&&id!==${JSON.stringify(initial_lesson.current_id)})document.documentElement.dataset.mortgagePending='true'}catch{}`;
  return (
    <main className="mortgage-learning-page" id="map-top">
      <script dangerouslySetInnerHTML={{ __html: legacy_hash_guard }} />
      <MortgageMap
        initial_lesson={initial_lesson}
        initial_detail={mortgage_lesson(initial_lesson.current_id)!}
        navigation={learning_navigation}
        routes={learning_routes}
        home_link={
          <Link href="/#projects" aria-label="Back to projects">
            <Sprout size={28} aria-hidden="true" />
          </Link>
        }
      />
    </main>
  );
}
