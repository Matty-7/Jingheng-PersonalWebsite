import Link from 'next/link';
import Image from 'next/image';
import { BrandMark } from '@/components/brand_mark';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { get_visible_posts, newsletterUrl, formatDate } from '@/lib/publishing';
import profile from '@/content/profile.json';
import { pageMetadata } from '@/lib/seo';
export const metadata: Metadata = pageMetadata(
  'Newsletters — Jingheng Huan',
  'Essays and newsletters from Jingheng Huan, also known as Matty Huan.',
  '/journal',
);
export default function Journal() {
  const publishedPosts = get_visible_posts();
  return (
    <main className="journal-page">
      <nav className="journal-nav" aria-label="Newsletter navigation">
        <Link className="brand-link" href="/" aria-label="Jingheng Huan home">
          <BrandMark />
        </Link>
        <Link href="/">
          <ArrowLeft size={16} /> Back to the living room
        </Link>
      </nav>
      <header>
        <p className="eyebrow">WORDS, IN MY OWN TIME</p>
        <h1>
          <em>Newsletters.</em>
        </h1>
        <p>
          Essays and newsletters.
          <br />A place to think out loud, and keep a few things.
        </p>
      </header>
      <section className="journal-entries" aria-label="Published newsletters">
        {publishedPosts.length ? (
          publishedPosts.map((post) => (
            <article className="journal-entry" key={post.slug}>
              <p className="eyebrow">
                {post.kind} ·{' '}
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              <h2>
                <a href={post.external_url}>
                  {post.title} <ArrowUpRight size={24} />
                </a>
              </h2>
            </article>
          ))
        ) : (
          <div className="journal-empty">
            <p className="eyebrow">THE FIRST PAGE</p>
            <h2>
              Still taking <em>shape.</em>
            </h2>
            <p>
              I haven’t published an entry here yet. In the meantime, you can
              find me in conversation on Talking Laughs, or on YouTube.
            </p>
            <div className="journal-follow">
              <a
                className="text-link"
                href={profile.links.youtube}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube <ArrowUpRight size={17} />
              </a>
              <a
                className="text-link"
                href={profile.links.podcast}
                target="_blank"
                rel="noreferrer"
              >
                Listen to Talking Laughs <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        )}
      </section>
      <aside className="journal-newsletter">
        <Image
          unoptimized
          src="/images/newsletter-mark.png"
          width={128}
          height={128}
          alt="文 — Newsletters by Jingheng"
          loading="lazy"
        />
        <p className="eyebrow">NEWSLETTERS FROM JINGHENG</p>
        <h2>
          From time <em>to time.</em>
        </h2>
        {newsletterUrl ? (
          <a
            className="text-link"
            href={newsletterUrl}
            target="_blank"
            rel="noreferrer"
          >
            Read on Substack <ArrowUpRight size={18} />
          </a>
        ) : (
          <p>
            Future editions will be distributed on Substack.
          </p>
        )}
      </aside>
      <div className="journal-bottom">
        <span>JINGHENG HUAN</span>
        <a href={`${profile.siteUrl}/feed.xml`}>
          Newsletter RSS <ArrowUpRight size={15} />
        </a>
      </div>
    </main>
  );
}
