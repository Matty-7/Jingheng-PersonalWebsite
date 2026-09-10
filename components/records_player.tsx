'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageStatus } from '@/components/image_status';
import { Tonearm } from '@/components/tonearm';
import music from '@/content/music.json';

type Track = (typeof music)[number];
const number = (i: number) => String(i + 1).padStart(2, '0');
const time = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function RecordsPlayer() {
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
            {message && <output className="playback-message">{message}</output>}
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
