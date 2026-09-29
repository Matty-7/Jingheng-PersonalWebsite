import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import { HomeHero } from '@/components/home_hero';
import { HomeMotion } from '@/components/home_motion';
import { BrandMark } from '@/components/brand_mark';
import { RecordsPlayer } from '@/components/records_player';
import { TerminalScene } from '@/components/terminal_scene';
import { PlaybillCollection } from '@/components/playbill_collection';
import { SocialIcon } from '@/components/social_icon';
import { ProjectMapPreview } from '@/components/project_map_preview';
import films from '@/content/films.json';
import { Bookshelf } from '@/components/bookshelf';
import profile from '@/content/profile.json';
import channels from '@/content/channels.json';
import {
  mortgage_domains,
  mortgage_preview_path,
} from '@/content/mortgage_domains';
import { homeStructuredData, serializeStructuredData } from '@/lib/seo';
const newsletterUrl = profile.newsletterUrl as string | null;

const number = (i: number) => String(i + 1).padStart(2, '0');

export default function Home() {
  return (
    <>
      <HomeMotion />
      <nav className="site-nav home-nav" aria-label="Main navigation">
        <a href="#home" className="brand-link" aria-label="Jingheng Huan home">
          <BrandMark />
        </a>
        <div className="nav-links">
          <a
            href={channels.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
          <a
            href={channels.podcast.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Podcast
          </a>
          {newsletterUrl ? (
            <a href={newsletterUrl} target="_blank" rel="noopener noreferrer">
              Newsletter
            </a>
          ) : null}
          <a href="#projects">Projects</a>
          <a href="#records">Music</a>
          <a href="#films">Films</a>
          <a href="#books">Book</a>
          <a href="#broadway">Broadway</a>
        </div>
        <div className="reading-progress" aria-hidden="true" />
      </nav>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(homeStructuredData),
          }}
        />
        <section id="home" className="arrival">
          <HomeHero />
          <a className="scroll-invitation" href="#channels">
            Come in. Stay a while. <ArrowDown size={20} />
          </a>
        </section>
        <section id="channels" className="channels-section">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">01 / IN MY OWN OPINION</p>
            <h2>
              Things to share.
              <br />
              <em>People to talk to.</em>
            </h2>
          </div>
          <div className="publishing-grid">
            <article
              id="youtube"
              className="publishing-card publishing-video"
              data-reveal
            >
              <div className="publishing-label">
                <SocialIcon name="youtube" />
                <p className="eyebrow">YOUTUBE</p>
              </div>
              <h3 className="channel-brand">
                <Image
                  unoptimized
                  src="/images/youtube-mark.png"
                  width={128}
                  height={128}
                  alt="視 — Jingheng’s YouTube"
                  loading="lazy"
                />
              </h3>
              <a
                className="text-link"
                href={channels.youtube.url}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube
              </a>
            </article>
            <article
              id="podcast"
              className="publishing-card publishing-audio"
              data-reveal
            >
              <div className="publishing-label">
                <SocialIcon name="applepodcasts" />
                <p className="eyebrow">PODCAST</p>
              </div>
              <h3 className="podcast-brand">
                <Image
                  unoptimized
                  src={channels.podcast.artwork}
                  width={128}
                  height={128}
                  alt="Talking Laughs"
                  loading="lazy"
                />
              </h3>
              <a
                className="text-link"
                href={channels.podcast.url}
                target="_blank"
                rel="noreferrer"
              >
                Listen to the show
              </a>
            </article>
            <article className="publishing-card publishing-writing" data-reveal>
              <div className="publishing-label">
                <SocialIcon name="substack" />
                <p className="eyebrow">SUBSTACK</p>
              </div>
              <h3 className="channel-brand">
                <Image
                  unoptimized
                  src="/images/newsletter-mark.png"
                  width={128}
                  height={128}
                  alt="文 — Newsletters by Jingheng"
                  loading="lazy"
                />
              </h3>
              {newsletterUrl ? (
                <a
                  className="text-link"
                  href={newsletterUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read on Substack
                </a>
              ) : null}
            </article>
          </div>
        </section>
        <span id="portfolio" aria-hidden="true" />
        <section
          id="projects"
          className="projects-section"
          aria-labelledby="projects-heading"
        >
          <div className="projects-heading" data-reveal>
            <h2 id="projects-heading">
              <em>Projects.</em>
            </h2>
          </div>
          <article className="projects-entry" data-reveal>
            <div className="projects-copy">
              <h3>Mortgage Map</h3>
              <p>
                Explore mortgage cash flows, interest rates and structured
                credit through connected concepts, reading paths and public
                sources.
              </p>
              <Link href="/portfolio/mortgage-map" className="text-link">
                Explore the map <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div
              className="project-map-preview"
              aria-label="Explore the Mortgage Map"
            >
              <div
                className="project-map-path"
                aria-label="From borrower decisions to valuation"
              >
                {mortgage_preview_path.map((step, i) => (
                  <Link
                    href={`/portfolio/mortgage-map#concept=${step.id}`}
                    key={step.id}
                  >
                    <span className="project-step-number">0{i + 1}</span>
                    <strong>{step.title}</strong>
                    <span>{step.detail}</span>
                    {i < mortgage_preview_path.length - 1 && (
                      <span className="project-path-arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              <div className="project-domain-links">
                {mortgage_domains.map((domain) => (
                  <Link
                    href={`/portfolio/mortgage-map#concept=${domain.entry}`}
                    key={domain.id}
                  >
                    <span>{domain.number}</span>
                    {domain.title}
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </article>
          <article className="projects-entry" data-reveal>
            <div className="projects-copy">
              <h3>New York Atlas</h3>
              <p>
                Explore the city through film, television, literature and music.
                Find the scenes, passages and songs connected to a place, with
                original sources and previews.
              </p>
              <Link href="/portfolio/new-york-atlas" className="text-link">
                Explore the atlas <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <ProjectMapPreview
              href="/portfolio/new-york-atlas"
              label="Open New York Atlas"
              artwork={{
                src: '/images/film-map/manhattan-poster.jpg',
                alt: 'Manhattan (1979) poster with the Queensboro Bridge and skyline lettering',
                width: 640,
                height: 940,
              }}
              eyebrow="FILM & TV · LITERATURE · MUSIC"
              headline="New York"
              emphasis="Atlas."
              summary="Scenes, passages and songs"
            />
          </article>
        </section>
        <RecordsPlayer />
        <section
          id="films"
          className="film-section"
          aria-labelledby="film-heading"
        >
          <div className="film-sticky">
            <div className="film-heading">
              <div>
                <p className="eyebrow">03 / AFTER THE CREDITS</p>
                <h2 id="film-heading">
                  Some films
                  <br />
                  <em>never leave.</em>
                </h2>
              </div>
              <p>Ten films that stay with me.</p>
            </div>
            <div className="film-window">
              <div className="film-track" id="film-track">
                {films.map((film, i) => (
                  <article className="film-card" key={film.slug}>
                    <div className="poster-frame">
                      {film.poster ? (
                        <Image
                          unoptimized
                          src={film.poster}
                          alt={`${film.title} — ${film.posterTreatment === 'impressionist' ? 'official poster with a light impressionist treatment' : 'official poster'}`}
                          width="500"
                          height="750"
                          loading="lazy"
                        />
                      ) : (
                        <div className="poster-awaiting">
                          <span>{number(i)}</span>
                          <h3>{film.title}</h3>
                        </div>
                      )}
                      <span className="film-index">{number(i)} / 10</span>
                    </div>
                    <h3>{film.title}</h3>
                    <p className="film-meta">
                      {film.year} · {film.director}
                    </p>
                  </article>
                ))}
              </div>
            </div>
            <div className="film-footer">
              <span>FAVORITE DIRECTORS · HITCHCOCK / NOLAN / SCORSESE</span>
              <div className="film-progress" aria-hidden="true">
                <span />
              </div>
            </div>
          </div>
        </section>
        <section id="books" className="books-section">
          <div className="books-intro" data-reveal>
            <div>
              <p className="eyebrow">04 / READ</p>
              <h2>
                Other lives.
                <br />
                <em>One bookshelf.</em>
              </h2>
            </div>
            <p>Ten books I keep close.</p>
          </div>
          <Bookshelf />
        </section>
        <PlaybillCollection />
        <TerminalScene />
        <footer>
          <div>
            <p className="eyebrow">UNTIL NEXT TIME</p>
            <h2>
              Come by
              <br />
              <em>again.</em>
            </h2>
          </div>
          <nav
            className="footer-links social-links"
            aria-label="Find me elsewhere"
          >
            <a
              href={profile.links.github}
              target="_blank"
              rel="me noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <SocialIcon name="github" />
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <SocialIcon name="linkedin" />
            </a>
            <a
              href={profile.links.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <SocialIcon name="instagram" />
            </a>
            <a
              href={channels.youtube.url}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              title="YouTube"
            >
              <SocialIcon name="youtube" />
            </a>
            <a
              href={channels.podcast.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Talking Laughs podcast"
              title="Talking Laughs"
            >
              <SocialIcon name="applepodcasts" />
            </a>
            {newsletterUrl ? (
              <a
                href={newsletterUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Newsletters on Substack"
                title="Substack"
              >
                <SocialIcon name="substack" />
              </a>
            ) : null}
          </nav>
          <p className="footer-small">JINGHENG HUAN</p>
        </footer>
      </main>
    </>
  );
}
