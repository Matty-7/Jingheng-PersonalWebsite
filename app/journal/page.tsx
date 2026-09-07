import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { publishedPosts, newsletterUrl, formatDate } from '@/lib/publishing';
import profile from '@/content/profile.json';
import { pageMetadata } from '@/lib/seo';
export const metadata: Metadata = pageMetadata(
  'Journal — Jingheng Huan',
  'Essays, notes, and letters from Jingheng Huan, also known as Matty Huan.',
  '/journal',
);
export default function Journal() {
  return (
    <main className="journal-page">
      <nav className="journal-nav" aria-label="Journal navigation">
        <Link className="brand-link" href="/" aria-label="Jingheng Huan home">
          <Image unoptimized src="/favicon.svg" width={40} height={40} alt="" />
        </Link>
        <Link href="/">
          <ArrowLeft size={16} /> Back to the living room
        </Link>
      </nav>
      <header>
        <p className="eyebrow">WORDS, IN MY OWN TIME</p>
        <h1>
          The <em>journal.</em>
        </h1>
        <p>
          Essays, notes, and letters.
          <br />A place to think out loud, and keep a few things.
        </p>
      </header>
      <section className="journal-entries" aria-label="Journal entries">
        {publishedPosts.length ? (
          publishedPosts.map((post) => (
            <article className="journal-entry" key={post.slug}>
              <p className="eyebrow">
                {post.kind} ·{' '}
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              <h2>
                <Link href={`/journal/${post.slug}`}>
                  {post.title} <ArrowUpRight size={24} />
                </Link>
              </h2>
              <p>{post.excerpt}</p>
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
        <p className="eyebrow">LETTERS FROM JINGHENG</p>
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
            Subscribe to my letters <ArrowUpRight size={18} />
          </a>
        ) : (
          <p>
            A newsletter is on the horizon. Subscription details will appear
            here when the first letter is ready.
          </p>
        )}
      </aside>
      <div className="journal-bottom">
        <span>JINGHENG HUAN</span>
        <a href={`${profile.siteUrl}/feed.xml`}>
          Journal RSS <ArrowUpRight size={15} />
        </a>
      </div>
    </main>
  );
}
