import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { get_visible_posts } from '@/lib/publishing';

type Props = { params: Promise<{ slug: string }> };

// Keep old bookmarks useful without publishing a second copy of the essay.
export const metadata: Metadata = {
  title: 'Newsletters — Jingheng Huan',
  robots: { index: false, follow: true },
};

export default async function Entry({ params }: Props) {
  const { slug } = await params;
  const post = get_visible_posts().find((entry) => entry.slug === slug);
  if (!post) notFound();
  permanentRedirect(post.external_url);
}
