import Link from 'next/link';
import { BrandMark } from '@/components/brand_mark';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { get_visible_posts, formatDate } from '@/lib/publishing';
import {
  absoluteUrl,
  pageMetadata,
  personId,
  serializeStructuredData,
} from '@/lib/seo';
import profile from '@/content/profile.json';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = get_visible_posts().find((p) => p.slug === slug);
  return post
    ? pageMetadata(
        `${post.title} — Jingheng Huan`,
        post.excerpt,
        `/journal/${post.slug}`,
        {
          publishedTime: `${post.date}T00:00:00Z`,
        },
      )
    : {
        title: 'Not found — Jingheng Huan',
        robots: { index: false, follow: true },
      };
}
export default async function Entry({ params }: Props) {
  const { slug } = await params;
  const post = get_visible_posts().find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <main className="journal-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeStructuredData({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: `${post.date}T00:00:00Z`,
            url: absoluteUrl(`/journal/${post.slug}`),
            mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
            inLanguage: 'en-US',
            author: {
              '@type': 'Person',
              '@id': personId,
              name: profile.name,
              url: absoluteUrl('/'),
            },
          }),
        }}
      />
      <nav className="journal-nav" aria-label="Article navigation">
        <Link className="brand-link" href="/" aria-label="Jingheng Huan home">
          <BrandMark />
        </Link>
        <Link href="/journal">
          <ArrowLeft size={16} /> All entries
        </Link>
      </nav>
      <article className="longform">
        <header>
          <p className="eyebrow">
            {post.kind} ·{' '}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
          <h1>{post.title}</h1>
          <p className="article-subtitle">{post.excerpt}</p>
          <p className="article-byline">By Jingheng Huan</p>
        </header>
        <div className="article-body">
          {post.blocks.map((block, i) =>
            block.type === 'heading' ? (
              <h2 key={i}>{block.text}</h2>
            ) : (
              <p key={i}>{block.text}</p>
            ),
          )}
        </div>
      </article>
    </main>
  );
}
