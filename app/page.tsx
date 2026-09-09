'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import Image from 'next/image';
import {
  ArrowDown,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroName } from '@/components/hero_name';
import { BrandMark } from '@/components/brand_mark';
import { useImageStatus } from '@/components/image_status';
import { Tonearm } from '@/components/tonearm';
import { RoomScene } from '@/components/room_scene';
import { TerminalScene } from '@/components/terminal_scene';
import { PlaybillCollection } from '@/components/playbill_collection';
import { SocialIcon } from '@/components/social_icon';
import music from '@/content/music.json';
import films from '@/content/films.json';
import books from '@/content/books.json';
import profile from '@/content/profile.json';
import channels from '@/content/channels.json';
import { homeStructuredData, serializeStructuredData } from '@/lib/seo';
const newsletterUrl = profile.newsletterUrl as string | null;

type Track = (typeof music)[number];
const number = (i: number) => String(i + 1).padStart(2, '0');
const time = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function Home() {
  const [hero_paused, set_hero_paused] = useState(false);
  const {
    image_ref: turntable_base_ref,
    state: turntable_base_state,
    on_load: turntable_base_load,
    on_error: turntable_base_error,
  } = useImageStatus();
  const {
    image_ref: turntable_mask_ref,
    state: turntable_mask_state,
    on_load: turntable_mask_load,
    on_error: turntable_mask_error,
  } = useImageStatus();
  const audio = useRef<HTMLAudioElement | null>(null);
  const request = useRef(0);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [message, setMessage] = useState('');
  const track = music[selected];
  const [selected_book, set_selected_book] = useState<number | null>(null);
  const [loaded_book_covers, set_loaded_book_covers] = useState<Record<string, boolean>>({});
  const book = selected_book === null ? null : books[selected_book];

  const playTrack = useCallback(async (index: number) => {
    const a = audio.current;
    if (!a || !Number.isInteger(index) || index < 0 || index >= music.length)
      return;
    const ticket = ++request.current;
    setSelected(index);
    setStarted(true);
    setLoading(true);
    setMessage('');
    if (a.dataset.track !== String(index)) {
      a.pause();
      a.src = music[index].previewUrl;
      a.dataset.track = String(index);
      a.load();
      setElapsed(0);
      setDuration(0);
    }
    try {
      await a.play();
      if (ticket === request.current) setPlaying(true);
    } catch (error) {
      if (ticket === request.current) {
        setPlaying(false);
        setMessage(
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'Tap play to start the preview.'
            : 'This preview is unavailable right now. You can still listen on Apple Music.',
        );
      }
    } finally {
      if (ticket === request.current) setLoading(false);
    }
  }, []);
  const toggle = useCallback(() => {
    if (audio.current && !audio.current.paused) {
      ++request.current;
      audio.current.pause();
      setLoading(false);
    } else void playTrack(selected);
  }, [selected, playTrack]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const film_motion_query = window.matchMedia(
      '(min-width: 760px) and (prefers-reduced-motion: no-preference)',
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
    const parallax = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax]'),
    );
    const posters = Array.from(
      document.querySelectorAll<HTMLElement>('.poster-frame'),
    );
    const resizeObserver = new ResizeObserver(() => schedule());
    if (filmTrack) resizeObserver.observe(filmTrack);
    let raf = 0;
    const reset_film_motion = () => {
      filmSection?.classList.remove('film-motion-ready');
      filmSection?.style.removeProperty('--film-height');
      filmSection?.style.removeProperty('--film-progress');
      filmSection?.style.removeProperty('height');
      filmTrack?.style.removeProperty('--film-transform');
      filmTrack?.style.removeProperty('transform');
      posters.forEach((el) => el.style.removeProperty('--depth'));
    };
    const update = () => {
      raf = 0;
      document.documentElement.style.setProperty(
        '--page-progress',
        String(
          window.scrollY /
            Math.max(
              1,
              document.documentElement.scrollHeight - window.innerHeight,
            ),
        ),
      );
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        const progress = Math.max(
          -1,
          Math.min(
            1,
            (window.innerHeight / 2 - r.top - r.height / 2) /
              window.innerHeight,
          ),
        );
        el.style.setProperty(
          '--drift',
          reduced.matches ? '0' : String(progress),
        );
      });
      if (hero) {
        const p = Math.min(
          1,
          Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight),
        );
        hero.style.setProperty(
          '--hero-progress',
          reduced.matches ? '0' : String(p),
        );
      }
      if (filmSection && filmTrack) {
        if (film_motion_query.matches) {
          filmSection.classList.add('film-motion-ready');
          const distance = Math.max(
            0,
            filmTrack.scrollWidth -
              window.innerWidth +
              window.innerWidth * 0.09,
          );
          filmSection.style.setProperty(
            '--film-height',
            `${window.innerHeight + distance * 1.2}px`,
          );
          const rect = filmSection.getBoundingClientRect();
          const progress = Math.max(
            0,
            Math.min(
              1,
              -rect.top / Math.max(1, rect.height - window.innerHeight),
            ),
          );
          filmTrack.style.setProperty(
            '--film-transform',
            `translate3d(${-progress * distance}px,0,0)`,
          );
          filmSection.style.setProperty('--film-progress', String(progress));
          posters.forEach((el) => {
            const r = el.getBoundingClientRect();
            const depth = Math.max(
              -1,
              Math.min(
                1,
                (r.left + r.width / 2 - window.innerWidth / 2) /
                  window.innerWidth,
              ),
            );
            el.style.setProperty('--depth', String(depth));
          });
        } else {
          reset_film_motion();
        }
      }
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    film_motion_query.addEventListener('change', schedule);
    update();
    return () => {
      reset_film_motion();
      document.documentElement.classList.remove('motion-ready');
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
      film_motion_query.removeEventListener('change', schedule);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    type Registry = {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: object;
          execute: (input: unknown) => unknown;
        },
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const context = (document as Document & { modelContext?: Registry })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: 'select_record',
      title: 'Select a record',
      description:
        'Select one of the ten records and move to the record player. Does not start audio.',
      inputSchema: {
        type: 'object',
        properties: {
          recordNumber: { type: 'integer', minimum: 1, maximum: 10 },
        },
        required: ['recordNumber'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const n = (input as { recordNumber?: unknown })?.recordNumber;
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 1 || n > 10)
          throw new Error('recordNumber must be an integer from 1 to 10.');
        ++request.current;
        audio.current?.pause();
        setLoading(false);
        setSelected(n - 1);
        setElapsed(0);
        setDuration(0);
        document
          .getElementById('records')
          ?.scrollIntoView({ behavior: 'auto' });
        return {
          recordNumber: n,
          title: music[n - 1].trackName,
          playing: false,
        };
      },
    };
    try {
      Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);

  return (
    <>
      <nav className="site-nav home-nav" aria-label="Main navigation">
        <a href="#home" className="brand-link" aria-label="Jingheng Huan home">
          <BrandMark />
        </a>
        <div className="nav-links">
          <a href="#channels">Channels</a>
          <Link href="/journal">Newsletters</Link>
          <a href="#records">Music</a>
          <a href="#films">Films</a>
          <a href="#books">Books</a>
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
            <p className="eyebrow">01 / IN MY OWN VOICE</p>
            <h2>
              Things to share.
              <br />
              <em>People to talk to.</em>
            </h2>
          </div>
          <div className="publishing-grid">
            <article className="publishing-card publishing-video" data-reveal>
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
              <p>Another way to get to know me.</p>
              <a
                className="text-link"
                href={channels.youtube.url}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube
              </a>
            </article>
            <article className="publishing-card publishing-audio" data-reveal>
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
              <p>Conversations with Jason, in Mandarin.</p>
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
              <p>
                Notes on culture and whatever stays on my mind. Start with{' '}
                <a
                  href="https://jinghenghuan.substack.com/p/something-of-my-own"
                  target="_blank"
                  rel="noreferrer"
                >
                  Something of My Own
                </a>
                .
              </p>
              {newsletterUrl ? (
                <a
                  className="text-link"
                  href={newsletterUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read on Substack
                </a>
              ) : (
                <Link className="text-link" href="/journal">
                  Read newsletters
                </Link>
              )}
            </article>
          </div>
        </section>
        <section id="records" className="records-section">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">02 / ON ROTATION</p>
            <h2>
              Put something
              <br />
              <em>good on.</em>
            </h2>
            <p>Ten songs I return to.</p>
          </div>
          <div className="listening-room">
            <div className="player-column">
              <div
                className={`turntable ${playing ? 'is-playing' : ''}`}
                data-image-ready={
                  turntable_base_state === 'loaded' &&
                  turntable_mask_state === 'loaded'
                }
                aria-hidden="true"
              >
                <Image
                  unoptimized
                  className="turntable-base"
                  ref={turntable_base_ref}
                  onLoad={turntable_base_load}
                  onError={turntable_base_error}
                  src="/images/turntable-base.jpg"
                  width="1448"
                  height="1086"
                  alt=""
                />
                <Image
                  unoptimized
                  className="turntable-mask-probe"
                  src="/images/turntable.png"
                  ref={turntable_mask_ref}
                  onLoad={turntable_mask_load}
                  onError={turntable_mask_error}
                  width={1}
                  height={1}
                  alt=""
                />
                <div className="vinyl-disc">
                  <div className="vinyl-spin">
                    <Image
                      unoptimized
                      src={track.artwork}
                      alt=""
                      width={160}
                      height={160}
                    />
                  </div>
                </div>
                <Tonearm />
              </div>
              <div className="now-playing">
                <span className="eyebrow">
                  {loading
                    ? 'LOADING PREVIEW'
                    : playing
                      ? 'NOW PLAYING'
                      : 'ON THE TURNTABLE'}{' '}
                  · {number(selected)}
                </span>
                <h3>{track.trackName}</h3>
                <p>{track.displayArtist}</p>
              </div>
              <div className="player-controls">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous record"
                  onClick={() => void playTrack((selected + 9) % 10)}
                >
                  <SkipBack size={18} />
                </Button>
                <Button
                  className="play-control"
                  onClick={toggle}
                  aria-label={
                    playing
                      ? 'Pause preview'
                      : `Play preview of ${track.trackName}`
                  }
                >
                  {playing ? <Pause size={20} /> : <Play size={20} />}{' '}
                  {loading ? 'Loading…' : playing ? 'Pause' : 'Play preview'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next record"
                  onClick={() => void playTrack((selected + 1) % 10)}
                >
                  <SkipForward size={18} />
                </Button>
              </div>
              <progress
                className="audio-progress"
                aria-label="Preview playback progress"
                max={duration || 1}
                value={elapsed}
              />
              <div className="audio-caption">
                <span>
                  {time(elapsed)} / {duration ? time(duration) : 'Preview'}
                </span>
                <a href={track.appleMusicUrl} target="_blank" rel="noreferrer">
                  Full song on Apple Music
                </a>
              </div>
              {message && (
                <output className="playback-message">{message}</output>
              )}
            </div>
            <ol className="record-list">
              {music.map((t: Track, i) => (
                <li key={t.trackId}>
                  <button
                    className={`record-row ${i === selected ? 'selected' : ''}`}
                    onClick={() => void playTrack(i)}
                    aria-label={`Play preview: ${t.trackName} by ${t.displayArtist}`}
                    aria-current={i === selected ? 'true' : undefined}
                  >
                    <span className="record-number">
                      {i === selected && playing ? (
                        <Volume2 size={17} />
                      ) : (
                        number(i)
                      )}
                    </span>
                    <Image
                      unoptimized
                      src={t.artwork}
                      alt={`${t.album} album cover`}
                      width="64"
                      height="64"
                      loading="lazy"
                    />
                    <span className="record-info">
                      <strong>{t.trackName}</strong>
                      <span>{t.displayArtist}</span>
                    </span>
                    <span className="record-arrow">
                      <Play size={15} />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>
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
              <p className="eyebrow">04 / IN THE MARGINS</p>
              <h2>
                Other lives.
                <br />
                <em>One bookshelf.</em>
              </h2>
            </div>
            <p>Ten books I keep close.</p>
          </div>
          <div className="bookshelf" aria-label="Ten books on my bookshelf">
            {books.map((b, i) => (
              <div className="shelf-slot" key={b.slug}>
                <div
                  className="book-reveal"
                  data-reveal
                  style={
                    {
                      '--book-delay': `${(i % 5) * 85}ms`,
                      '--book-ratio': b.coverWidth / b.coverHeight,
                      '--book-cover': loaded_book_covers[b.slug] ? `url("${b.cover}")` : 'none',
                    } as CSSProperties
                  }
                >
                  <Button
                    variant="ghost"
                    className={`bookshelf-book ${selected_book === i ? 'chosen' : ''}`}
                    onClick={() => set_selected_book((current) => current === i ? null : i)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') set_selected_book(null);
                    }}
                    aria-pressed={selected_book === i}
                    aria-controls="book-details"
                    aria-label={`${b.title} by ${b.author}`}
                  >
                    <span className="book-volume">
                      <span className="book-back" aria-hidden="true" />
                      <span className="book-spine" aria-hidden="true" />
                      <span className="book-pages" aria-hidden="true" />
                      <span className="book-top" aria-hidden="true" />
                      <span className="book-front">
                        <Image
                          unoptimized
                          src={b.cover}
                          width={b.coverWidth}
                          height={b.coverHeight}
                          alt={`${b.title} book cover`}
                          loading="lazy"
                          onLoad={() => set_loaded_book_covers((current) =>
                            current[b.slug] ? current : { ...current, [b.slug]: true },
                          )}
                        />
                      </span>
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div
            id="book-details"
            className="book-details"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="book-detail-copy" key={book?.slug ?? 'shelved'}>
              <p className="eyebrow">{book ? 'OFF THE SHELF' : 'ON THE SHELF'}</p>
              <h3>{book?.title ?? 'Pick a book.'}</h3>
              {book && <p className="book-author">{book.author}</p>}
            </div>
          </div>
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
              href={profile.links.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              title="YouTube"
            >
              <SocialIcon name="youtube" />
            </a>
            <a
              href={profile.links.podcast}
              target="_blank"
              rel="noreferrer"
              aria-label="Talking Laughs on Xiaoyuzhou"
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
            ) : (
              <Link
                href="/journal"
                aria-label="Newsletters"
                title="Newsletters"
              >
                <SocialIcon name="substack" />
              </Link>
            )}
          </nav>
          <p className="footer-small">JINGHENG HUAN</p>
        </footer>
      </main>
      {/* Music previews have track and artist labels; synchronized lyric transcripts are not supplied by Apple. */}
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        aria-label="Apple Music song preview"
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setMessage(
            'Preview finished. Listen to the full song on Apple Music.',
          );
        }}
        onLoadedMetadata={() =>
          setDuration(
            Number.isFinite(audio.current?.duration)
              ? audio.current!.duration
              : 0,
          )
        }
        onTimeUpdate={() => setElapsed(audio.current?.currentTime || 0)}
        onError={() => {
          setPlaying(false);
          setLoading(false);
          setMessage(
            'This preview is unavailable right now. Listen on Apple Music instead.',
          );
        }}
      />
      {started && (
        <aside className="mini-player" aria-label="Current record">
          <Image
            unoptimized
            src={track.artwork}
            alt=""
            width="42"
            height="42"
          />
          <a href="#records">
            <strong>{track.trackName}</strong>
            <span>{track.displayArtist} · Preview</span>
          </a>
          <Button
            variant="ghost"
            size="icon"
            aria-label={playing ? 'Pause preview' : 'Resume preview'}
            onClick={toggle}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next record"
            onClick={() => void playTrack((selected + 1) % 10)}
          >
            <SkipForward size={16} />
          </Button>
        </aside>
      )}
    </>
  );
}
