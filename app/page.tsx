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
  ArrowUpRight,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import music from '@/content/music.json';
import films from '@/content/films.json';
import books from '@/content/books.json';
import broadway from '@/content/broadway.json';
import profile from '@/content/profile.json';
import projects from '@/content/projects.json';
import channels from '@/content/channels.json';
import { homeStructuredData, serializeStructuredData } from '@/lib/seo';
const newsletterUrl = profile.newsletterUrl as string | null;

type Track = (typeof music)[number];
const number = (i: number) => String(i + 1).padStart(2, '0');
const time = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function Home() {
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
  const [selectedBook, setSelectedBook] = useState(0);
  const book = books[selectedBook];

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
    const update = () => {
      raf = 0;
      const small = window.innerWidth < 760;
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
        const distance = Math.max(
          0,
          filmTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.09,
        );
        if (!small && !reduced.matches) {
          filmSection.style.height = `${window.innerHeight + distance * 1.2}px`;
          const rect = filmSection.getBoundingClientRect();
          const progress = Math.max(
            0,
            Math.min(
              1,
              -rect.top / Math.max(1, rect.height - window.innerHeight),
            ),
          );
          filmTrack.style.transform = `translate3d(${-progress * distance}px,0,0)`;
          filmSection.style.setProperty('--film-progress', String(progress));
        } else {
          filmSection.style.height = 'auto';
          filmTrack.style.transform = 'none';
        }
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
          el.style.setProperty(
            '--depth',
            small || reduced.matches ? '0' : String(depth),
          );
        });
      }
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    update();
    return () => {
      document.documentElement.classList.remove('motion-ready');
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
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
      <a className="skip-link" href="#work">
        Skip to content
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#home" className="brand-link" aria-label="Jingheng Huan home">
          <Image unoptimized src="/favicon.svg" width={40} height={40} alt="" />
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#channels">Watch & listen</a>
          <Link href="/journal">Journal</Link>
          <a href="#records">The living room</a>
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
          <Image
            unoptimized
            src="/images/living-room.jpg"
            fetchPriority="high"
            width="1600"
            height="900"
            alt="An illustrated sunny living room with mid-century chairs, records, books, and a bird-of-paradise plant"
          />
          <div className="arrival-copy">
            <h1>
              <span>Jingheng</span>
              <br />
              <em>
                <span>Huan.</span>
              </em>
            </h1>
          </div>
          <a className="scroll-invitation" href="#work">
            Come in. Stay a while. <ArrowDown size={20} />
          </a>
        </section>
        <section id="work" className="work-section">
          <p className="eyebrow" data-reveal>
            01 / AT THE DESK
          </p>
          <div data-reveal>
            <h2>
              Curiosity,
              <br />
              <em>put to work.</em>
            </h2>
            <p className="work-intro">
              Engineering, financial markets,
              <br />
              and ideas worth exploring.
            </p>
          </div>
          <div className="project-stack">
            {projects.map((project) => (
              <article className="project" key={project.slug} data-reveal>
                <span>SELECTED WORK / {project.category.toUpperCase()}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <a href={project.url} target="_blank" rel="noreferrer">
                  {project.linkLabel} <ArrowUpRight size={18} />
                </a>
              </article>
            ))}
            <p className="work-postscript">
              A growing collection of things I build.
            </p>
          </div>
        </section>
        <section id="channels" className="channels-section">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">02 / IN MY OWN VOICE</p>
            <h2>
              Things to share.
              <br />
              <em>People to talk to.</em>
            </h2>
          </div>
          <div className="channel-grid">
            <article className="youtube-channel" data-reveal>
              <p className="eyebrow">YOUTUBE / @MATTYHUAN</p>
              <a
                className="youtube-title"
                href={channels.youtube.url}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  Matty
                  <br />
                  <em>Huan.</em>
                </span>
                <Play size={40} strokeWidth={1} />
                <span className="sr-only">Visit my YouTube channel</span>
              </a>
              <p>Another way to get to know me.</p>
              <a
                className="text-link"
                href={channels.youtube.url}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube <ArrowUpRight size={18} />
              </a>
            </article>
            <article className="podcast-channel" data-reveal data-parallax>
              <a
                className="podcast-cover"
                href={channels.podcast.url}
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  unoptimized
                  src={channels.podcast.artwork}
                  width={600}
                  height={600}
                  alt="Talking Laughs podcast cover"
                  loading="lazy"
                />
              </a>
              <div className="podcast-description">
                <p className="eyebrow">PODCAST / WITH JASON</p>
                <h3>{channels.podcast.title}</h3>
                <p>{channels.podcast.description}</p>
                <p className="channel-language">{channels.podcast.language}</p>
                <a
                  className="text-link"
                  href={channels.podcast.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Listen to the show <ArrowUpRight size={18} />
                </a>
              </div>
            </article>
          </div>
          <div className="episode-row">
            {channels.podcast.episodes.map((episode) => (
              <a
                className="episode"
                key={episode.id}
                href={episode.url}
                target="_blank"
                rel="noreferrer"
                data-reveal
              >
                <span className="eyebrow">
                  TALKING LAUGHS · {episode.duration.toUpperCase()}
                </span>
                <h3>
                  {episode.title} <ArrowUpRight size={21} />
                </h3>
                <p>
                  {episode.subtitle} ·{' '}
                  <time dateTime={episode.date}>
                    {new Date(episode.date + 'T12:00:00Z').toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC',
                      },
                    )}
                  </time>
                </p>
              </a>
            ))}
          </div>
        </section>
        <section id="journal" className="journal-section" data-parallax>
          <div data-reveal>
            <p className="eyebrow">03 / A WORK IN PROGRESS</p>
            <h2>
              A little more
              <br />
              <em>room to think.</em>
            </h2>
          </div>
          <div className="journal-intro" data-reveal>
            <h3>Journal & letters</h3>
            <p>
              Notes on work, culture, and whatever stays on my mind.
            </p>
            <Link className="text-link" href="/journal">
              Visit the journal <ArrowUpRight size={18} />
            </Link>
            {newsletterUrl ? (
              <a
                className="text-link newsletter-link"
                href={newsletterUrl}
                target="_blank"
                rel="noreferrer"
              >
                Letters in your inbox <ArrowUpRight size={18} />
              </a>
            ) : (
              <p className="newsletter-note">
                A newsletter will follow. For now, find me on YouTube and
                Talking Laughs.
              </p>
            )}
          </div>
        </section>
        <section id="records" className="records-section">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">04 / ON ROTATION</p>
            <h2>
              Put something
              <br />
              <em>good on.</em>
            </h2>
            <p>Ten records for an unhurried afternoon.</p>
          </div>
          <div className="listening-room">
            <div className="player-column">
              <div
                className={`turntable ${playing ? 'is-playing' : ''}`}
                aria-hidden="true"
              >
                <Image
                  unoptimized
                  className="turntable-base"
                  src="/images/turntable.webp"
                  width="1448"
                  height="1086"
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
                  Full song on Apple Music <ArrowUpRight size={14} />
                </a>
              </div>
              <output className="playback-message">
                {message || 'Apple Music preview · Press play to listen.'}
              </output>
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
                <p className="eyebrow">05 / AFTER THE CREDITS</p>
                <h2 id="film-heading">
                  Some films
                  <br />
                  <em>never leave.</em>
                </h2>
              </div>
              <p>
                Ten films. A few different ways
                <br />
                of seeing the world.
              </p>
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
                    <p className="film-note">{film.note}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="film-footer">
              <span>FAVORITE DIRECTORS · HITCHCOCK / NOLAN / SCORSESE</span>
              <a
                href="https://movie.douban.com/people/180864246/collect"
                target="_blank"
                rel="noreferrer"
              >
                The full film diary <ArrowUpRight size={16} />
              </a>
              <div className="film-progress" aria-hidden="true">
                <span />
              </div>
            </div>
          </div>
        </section>
        <section id="books" className="books-section">
          <div className="books-intro" data-reveal>
            <div>
              <p className="eyebrow">06 / IN THE MARGINS</p>
              <h2>
                Other lives.
                <br />
                <em>One bookshelf.</em>
              </h2>
            </div>
            <p>
              Ten books I keep close.
              <br />
              Pick one off the shelf.
            </p>
          </div>
          <div className="bookshelf" aria-label="Ten books on my bookshelf">
            {books.map((b, i) => (
              <div className="shelf-slot" key={b.slug}>
                <div
                  className="book-reveal"
                  data-reveal
                  style={
                    { '--book-delay': `${(i % 5) * 85}ms` } as CSSProperties
                  }
                >
                  <Button
                    variant="ghost"
                    className={`bookshelf-book ${selectedBook === i ? 'chosen' : ''}`}
                    onClick={() => setSelectedBook(i)}
                    aria-pressed={selectedBook === i}
                    aria-controls="book-details"
                    aria-label={`${b.title} by ${b.author}`}
                  >
                    <Image
                      unoptimized
                      src={b.cover}
                      width={b.coverWidth}
                      height={b.coverHeight}
                      alt={`${b.title} book cover`}
                      loading="lazy"
                    />
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
            <div className="book-detail-copy" key={book.slug}>
              <p className="eyebrow">OFF THE SHELF</p>
              <h3>{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <p className="book-note">{book.note}</p>
              <p className="book-edition">{book.edition}</p>
            </div>
            <a
              className="text-link"
              href={book.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              About this edition <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <section id="broadway" className="broadway-section" data-parallax>
          <div className="cast-sleeve" data-reveal>
            <Image
              unoptimized
              src={broadway.artwork}
              alt="Two Strangers (Carry a Cake Across New York), original London cast recording cover"
              loading="lazy"
              width="600"
              height="600"
            />
          </div>
          <div className="broadway-copy" data-reveal>
            <p className="eyebrow">07 / A LITTLE INTERMISSION</p>
            <h2>
              New York,
              <br />
              <em>on a high note.</em>
            </h2>
            <p>There’s always room for Broadway.</p>
            <h3>“New York”</h3>
            <p className="broadway-credit">
              Two Strangers (Carry a Cake Across New York)
              <br />
              Sam Tutty & Dujonna Gift · Original London Cast
            </p>
            <a
              className="text-link"
              href={broadway.appleMusicUrl}
              target="_blank"
              rel="noreferrer"
            >
              Listen on Apple Music <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <div className="closing-art" aria-hidden="true">
          <Image
            unoptimized
            src="/images/writing-corner.webp"
            alt=""
            width={1672}
            height={941}
            loading="lazy"
          />
        </div>
        <footer>
          <div>
            <p className="eyebrow">UNTIL NEXT TIME</p>
            <h2>
              Come by
              <br />
              <em>again.</em>
            </h2>
          </div>
          <div className="footer-links">
            <a href={profile.links.github} target="_blank" rel="me noreferrer">
              GitHub <ArrowUpRight />
            </a>
            <a href={profile.links.youtube} target="_blank" rel="noreferrer">
              YouTube <ArrowUpRight />
            </a>
            <a href={profile.links.podcast} target="_blank" rel="noreferrer">
              Talking Laughs <ArrowUpRight />
            </a>
            <Link href="/journal">
              Journal <ArrowUpRight />
            </Link>
            <a
              href="https://www.linkedin.com/in/jingheng-huan/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn <ArrowUpRight />
            </a>
            <a
              href="https://www.instagram.com/jinghenghuan/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram <ArrowUpRight />
            </a>
            <a
              href="https://www.douban.com/people/180864246/"
              target="_blank"
              rel="noreferrer"
            >
              Douban <ArrowUpRight />
            </a>
            <a
              href="https://music.apple.com/us/playlist/favorite-songs/pl.u-KRULJdg9MJ"
              target="_blank"
              rel="noreferrer"
            >
              The whole playlist <ArrowUpRight />
            </a>
          </div>
          <p className="footer-small">
            JINGHENG HUAN
          </p>
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
