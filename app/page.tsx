'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import { HeroName } from '@/components/hero_name';
import { BrandMark } from '@/components/brand_mark';
import { RecordsPlayer } from '@/components/records_player';
import { RoomScene } from '@/components/room_scene';
import { TerminalScene } from '@/components/terminal_scene';
import { PlaybillCollection } from '@/components/playbill_collection';
import { SocialIcon } from '@/components/social_icon';
import films from '@/content/films.json';
import { Bookshelf } from '@/components/bookshelf';
import profile from '@/content/profile.json';
import channels from '@/content/channels.json';
import { mortgage_domains, mortgage_preview_path } from '@/content/mortgage_domains';
import { homeStructuredData, serializeStructuredData } from '@/lib/seo';
const newsletterUrl = profile.newsletterUrl as string | null;

const number = (i: number) => String(i + 1).padStart(2, '0');

export default function Home() {
  const [hero_paused, set_hero_paused] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const film_motion_query = window.matchMedia(
      '(min-width: 760px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)',
    );
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll('[data-reveal]')
      .forEach((el) => observer.observe(el));
    const filmSection = document.getElementById('films');
    const filmTrack = document.getElementById('film-track');
    const hero = document.querySelector<HTMLElement>('.arrival');
    const cards = Array.from(
      filmTrack?.querySelectorAll<HTMLElement>('.film-card') ?? [],
    );
    const posters = cards.map((card) => card.querySelector<HTMLElement>('.poster-frame'));
    let layout_dirty = true;
    let film_enabled = false;
    let distance = 0;
    let film_height = 0;
    let card_centres: number[] = [];
    let last_progress = -1;
    let raf = 0;
    const invalidate_layout = () => {
      layout_dirty = true;
      schedule();
    };
    const resizeObserver = new ResizeObserver(invalidate_layout);
    if (filmTrack) resizeObserver.observe(filmTrack);
    const reset_film_motion = () => {
      filmSection?.classList.remove('film-motion-ready');
      filmSection?.style.removeProperty('--film-height');
      filmSection?.style.removeProperty('--film-progress');
      filmSection?.style.removeProperty('height');
      filmTrack?.style.removeProperty('--film-transform');
      filmTrack?.style.removeProperty('transform');
      posters.forEach((el) => el?.style.removeProperty('--depth'));
      last_progress = -1;
    };
    // Layout writes and measurements happen only on initialization/resize.
    // Stable scrolling never measures transformed posters or changes section height.
    const measure_layout = () => {
      layout_dirty = false;
      film_enabled = film_motion_query.matches && CSS.supports('height', '1cqh');
      if (!filmSection || !filmTrack) return;
      if (!film_enabled) {
        reset_film_motion();
        return;
      }
      filmSection.classList.add('film-motion-ready');
      distance = Math.max(
        0,
        filmTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.09,
      );
      film_height = window.innerHeight + distance * 1.2;
      const height = `${film_height}px`;
      if (filmSection.style.getPropertyValue('--film-height') !== height) {
        filmSection.style.setProperty('--film-height', height);
      }
      const track_left = filmTrack.getBoundingClientRect().left;
      card_centres = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return rect.left - track_left + rect.width / 2;
      });
      last_progress = -1;
    };
    const update = () => {
      raf = 0;
      if (layout_dirty) measure_layout();

      // Read every live geometry value before applying this frame's styles.
      const viewport_height = window.innerHeight;
      const viewport_width = window.innerWidth;
      const page_progress = window.scrollY / Math.max(
        1, document.documentElement.scrollHeight - viewport_height,
      );
      const hero_rect = hero?.getBoundingClientRect();
      const hero_progress = hero_rect
        ? Math.min(1, Math.max(0, -hero_rect.top / Math.max(1, hero_rect.height)))
        : 0;
      const film_rect = film_enabled ? filmSection?.getBoundingClientRect() : null;
      const film_progress = film_rect
        ? Math.max(0, Math.min(1, -film_rect.top / Math.max(1, film_height - viewport_height)))
        : 0;

      document.documentElement.style.setProperty('--page-progress', String(page_progress));
      hero?.style.setProperty('--hero-progress', reduced.matches ? '0' : String(hero_progress));
      if (film_enabled && filmSection && filmTrack && film_progress !== last_progress) {
        const translation = -film_progress * distance;
        filmTrack.style.setProperty('--film-transform', `translate3d(${translation}px,0,0)`);
        filmSection.style.setProperty('--film-progress', String(film_progress));
        posters.forEach((poster, index) => {
          const depth = Math.max(-1, Math.min(1,
            (card_centres[index] + translation - viewport_width / 2) / viewport_width,
          ));
          poster?.style.setProperty('--depth', String(depth));
        });
        last_progress = film_progress;
      }
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', invalidate_layout);
    reduced.addEventListener('change', invalidate_layout);
    film_motion_query.addEventListener('change', invalidate_layout);
    update();
    return () => {
      reset_film_motion();
      document.documentElement.classList.remove('motion-ready');
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', invalidate_layout);
      reduced.removeEventListener('change', invalidate_layout);
      film_motion_query.removeEventListener('change', invalidate_layout);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <nav className="site-nav home-nav" aria-label="Main navigation">
        <a href="#home" className="brand-link" aria-label="Jingheng Huan home">
          <BrandMark />
        </a>
        <div className="nav-links">
          <a href={channels.youtube.url} target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href={channels.podcast.url} target="_blank" rel="noopener noreferrer">Podcast</a>
          {newsletterUrl ? (
            <a href={newsletterUrl} target="_blank" rel="noopener noreferrer">Newsletter</a>
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
          <RoomScene
            paused={hero_paused}
            on_toggle={() => set_hero_paused((value) => !value)}
          />
          <div className="arrival-copy">
            <HeroName paused={hero_paused} />
          </div>
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
            <article id="youtube" className="publishing-card publishing-video" data-reveal>
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
            <article id="podcast" className="publishing-card publishing-audio" data-reveal>
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
        <section id="projects" className="projects-section" aria-labelledby="projects-heading">
          <div className="projects-heading" data-reveal>
            <h2 id="projects-heading"><em>Projects.</em></h2>
          </div>
          <article className="projects-entry" data-reveal>
            <div className="projects-copy">
              <h3>Mortgage Map</h3>
              <p>Explore mortgage cash flows, interest rates and structured credit through connected concepts, reading paths and public sources.</p>
              <Link href="/portfolio/mortgage-map" className="text-link">Explore the map <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="project-map-preview" aria-label="Explore the Mortgage Map">
              <div className="project-map-path" aria-label="From borrower decisions to valuation">
                {mortgage_preview_path.map((step, i) => (
                  <Link href={`/portfolio/mortgage-map#concept=${step.id}`} key={step.id}>
                    <span className="project-step-number">0{i + 1}</span>
                    <strong>{step.title}</strong>
                    <span>{step.detail}</span>
                    {i < mortgage_preview_path.length - 1 && <span className="project-path-arrow" aria-hidden="true">→</span>}
                  </Link>
                ))}
              </div>
              <div className="project-domain-links">
                {mortgage_domains.map((domain) => (
                  <Link href={`/portfolio/mortgage-map#concept=${domain.entry}`} key={domain.id}>
                    <span>{domain.number}</span>{domain.title}<span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </article>
          <article className="projects-entry projects-film-entry" data-reveal>
            <div className="projects-copy">
              <h3>NYC Film Map</h3>
              <p>Find the New York places behind familiar film scenes. Pick a film, explore its locations, and take a walk through the city.</p>
              <Link href="/portfolio/nyc-film-map" className="text-link">Explore film locations <span aria-hidden="true">↗</span></Link>
            </div>
            <Link className="project-film-preview" href="/portfolio/nyc-film-map" aria-label="Open NYC Film Map">
              <span>ON LOCATION / NEW YORK CITY</span>
              <strong>From the screen<br /><em>to the street.</em></strong>
              <span className="project-film-pair"><span>You’ve Got Mail<small>UPPER WEST SIDE</small></span><span>Anora<small>SOUTH BROOKLYN</small></span></span>
              <span className="project-film-footer">8 films · 26 places <span aria-hidden="true">↗</span></span>
            </Link>
          </article>
        </section>
        <section className="projects-section projects-music-section" aria-labelledby="music-map-project-heading">
          <article className="projects-entry" data-reveal>
            <div className="projects-copy">
              <h3 id="music-map-project-heading">NYC Music Map</h3>
              <p>Find the places named in songs, from Bleecker Street to the Queensboro Bridge. Hear a preview and explore the city on Google Maps.</p>
              <Link href="/portfolio/nyc-music-map" className="text-link">Explore songs and places <span aria-hidden="true">↗</span></Link>
            </div>
            <Link href="/portfolio/nyc-music-map" className="project-music-preview" aria-label="Open NYC Music Map">
              <Image src="/images/records/new-york-state-of-mind.jpg" alt="" width={180} height={180} unoptimized loading="lazy" />
              <span><small>NEW YORK, ON RECORD</small><strong>Find the places<br /><em>inside the songs.</em></strong><span>12 songs · 13 places <span aria-hidden="true">↗</span></span></span>
            </Link>
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
