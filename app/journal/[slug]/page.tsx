import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { publishedPosts, formatDate } from '@/lib/publishing';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = publishedPosts.find((p) => p.slug === slug);
  return post
    ? { title: `${post.title} — Jingheng Huan`, description: post.excerpt }
    : { title: 'Not found — Jingheng Huan' };
}
export default async function Entry({ params }: Props) {
  const { slug } = await params;
  const post = publishedPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <main className="journal-page">
      <nav className="journal-nav" aria-label="Article navigation">
        <Link className="wordmark" href="/">
          Jingheng Huan
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
          <p className="article-byline">By Jingheng Huan</p>
        </header>
        <div className="article-body">
          {post.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
