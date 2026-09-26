'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Film,
  Music2,
  Pause,
  Play,
  Search,
  X,
} from 'lucide-react';
import {
  atlas_connections,
  atlas_counts,
  atlas_embed_url,
  atlas_labels,
  atlas_location,
  atlas_maps_url,
  search_atlas,
  type AtlasEntry,
  type AtlasFilter,
} from '@/lib/new_york_atlas';
import { film_sources } from '@/lib/nyc_film_map';
import { artist_connection, preview_time } from '@/lib/nyc_music_map';
import { useMapLocation } from './use_map_location';
import { useMusicPreview } from './use_music_preview';

function AtlasImage({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const [failed, set_failed] = useState(false);
  return failed ? (
    <span className="atlas-image-fallback">Image unavailable</span>
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      loading="lazy"
      onError={() => set_failed(true)}
    />
  );
}

function MediumIcon({ medium }: { medium: AtlasEntry['medium'] }) {
  const Icon =
    medium === 'film' ? Film : medium === 'literature' ? BookOpen : Music2;
  return <Icon size={16} aria-hidden="true" />;
}

function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

function AtlasStory({ entry }: { entry: AtlasEntry }) {
  if (entry.medium === 'film') {
    const { scene } = entry;
    return (
      <div className="atlas-story">
        {scene.still && (
          <figure className="atlas-still">
            <AtlasImage
              key={scene.still.src}
              src={scene.still.src}
              alt={scene.still.alt}
              width={scene.still.width}
              height={scene.still.height}
            />
            <figcaption>
              {scene.still.credit} ·{' '}
              <SourceLink href={scene.still.source_url}>
                Frame source
              </SourceLink>
            </figcaption>
          </figure>
        )}
        <p>{scene.scene}</p>
        <div className="atlas-sources">
          {scene.source_ids.map((id) => {
            const source = film_sources.find((item) => item.id === id);
            return source ? (
              <SourceLink key={id} href={source.url}>
                {source.label}
              </SourceLink>
            ) : null;
          })}
        </div>
      </div>
    );
  }
  if (entry.medium === 'literature') {
    const { passage, work } = entry;
    return (
      <div className="atlas-story">
        <p className="atlas-eyebrow">Original words · {passage.excerpt_kind}</p>
        <blockquote cite={passage.source_url}>{passage.excerpt}</blockquote>
        <p className="atlas-caption">{passage.locator}</p>
        <SourceLink href={passage.source_url}>Read the source</SourceLink>
        <p>{passage.note}</p>
        <details className="atlas-notes">
          <summary>Text &amp; cover notes</summary>
          <p>
            {work.rights}. {passage.excerpt_kind} transcribed from the linked
            source; original wording retained.
          </p>
          {work.cover && (
            <>
              <p>
                {work.cover.edition} · {work.cover.credit}
              </p>
              <SourceLink href={work.cover.source_url}>Cover source</SourceLink>
            </>
          )}
          {passage.place_source_url && (
            <SourceLink href={passage.place_source_url}>
              Location reference
            </SourceLink>
          )}
        </details>
      </div>
    );
  }
  const { track, place } = entry;
  const connection = artist_connection(track, place.id);
  return (
    <div className="atlas-story">
      {connection && (
        <div className="atlas-connection-note">
          <p>{connection.note}</p>
          <SourceLink href={connection.source_url}>
            {connection.source_label}
          </SourceLink>
        </div>
      )}
      <p className="atlas-eyebrow">
        {connection
          ? 'About the song'
          : track.excerpt
            ? 'In the lyrics'
            : 'In the title'}
      </p>
      {track.excerpt && (
        <blockquote cite={track.source_url}>“{track.excerpt}”</blockquote>
      )}
      <p>{track.note}</p>
      <SourceLink href={track.source_url}>{track.source_label}</SourceLink>
      {track.excerpt && (
        <p className="atlas-caption">
          Short excerpt. Full lyrics at the source.
        </p>
      )}
    </div>
  );
}

const page_size = 10;

export function NewYorkAtlas({ google_maps_key }: { google_maps_key: string }) {
  const { state, update, ready } = useMapLocation(atlas_location);
  const { medium, query, entry_id } = state;
  const results = useMemo(() => search_atlas(medium, query), [medium, query]);
  const selected = results.find((entry) => entry.id === entry_id);
  const selected_index = Math.max(
    0,
    results.findIndex((entry) => entry.id === entry_id),
  );
  const page_start = Math.floor(selected_index / page_size) * page_size;
  const visible_results = results.slice(page_start, page_start + page_size);
  const detail_heading = useRef<HTMLHeadingElement>(null);
  const track = selected?.medium === 'music' ? selected.track : undefined;
  const {
    audio,
    audio_events,
    playing,
    loading,
    elapsed,
    duration,
    message,
    toggle_preview,
  } = useMusicPreview(track);
  const map_url = selected ? atlas_embed_url(selected, google_maps_key) : null;
  const related = selected ? atlas_connections(selected) : null;

  function select_entry(id: string, related_entry = false) {
    update({
      ...state,
      ...(related_entry ? { medium: 'all', query: '' } : {}),
      entry_id: id,
    });
    requestAnimationFrame(() => {
      const heading = detail_heading.current;
      if (!heading) return;
      heading.focus({ preventScroll: true });
      const bounds = heading.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
        heading.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });
  }

  return (
    <div className="atlas-explorer">
      <div className="atlas-controls">
        <fieldset className="atlas-filters">
          <legend className="sr-only">Content type</legend>
          {(['all', 'film', 'literature', 'music'] as AtlasFilter[]).map(
            (value) => (
              <button
                key={value}
                type="button"
                aria-pressed={medium === value}
                disabled={!ready}
                onClick={() =>
                  update({ ...state, medium: value, entry_id: null })
                }
              >
                {atlas_labels[value]}
                <span>
                  {value === 'all'
                    ? atlas_counts.film +
                      atlas_counts.literature +
                      atlas_counts.music
                    : atlas_counts[value]}
                </span>
              </button>
            ),
          )}
        </fieldset>
        <div className="atlas-search">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="atlas-search">
            Search the atlas
          </label>
          <input
            id="atlas-search"
            type="search"
            value={query}
            disabled={!ready}
            placeholder="Place, work or creator"
            onChange={(event) =>
              update(
                { ...state, query: event.target.value, entry_id: null },
                'replace',
              )
            }
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => update({ ...state, query: '', entry_id: null })}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="atlas-status">
        <output>
          {results.length} {results.length === 1 ? 'connection' : 'connections'}
          {query ? ` matching “${query}”` : ' between works and places'}
        </output>
        <span>One place can hold many stories.</span>
      </div>
      {selected ? (
        <div className="atlas-workspace">
          <aside className="atlas-index" aria-label="Atlas results">
            <div className="atlas-index-heading">
              <span>WORK / PLACE</span>
              <span>
                {page_start + 1}–
                {Math.min(page_start + page_size, results.length)}
              </span>
            </div>
            <div className="atlas-result-list">
              {visible_results.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="atlas-result"
                  data-medium={entry.medium}
                  aria-pressed={entry.id === entry_id}
                  onClick={() => select_entry(entry.id)}
                >
                  <span className="atlas-result-medium">
                    <MediumIcon medium={entry.medium} />
                    {atlas_labels[entry.medium]} ·{' '}
                    {entry.year ?? 'Year unverified'}
                  </span>
                  <strong>{entry.title}</strong>
                  <span>{entry.creator}</span>
                  <span className="atlas-result-place">{entry.place_name}</span>
                </button>
              ))}
            </div>
            <div className="atlas-pagination">
              <button
                type="button"
                disabled={!ready || page_start === 0}
                aria-label="Previous results"
                onClick={() => select_entry(results[page_start - page_size].id)}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <span>
                {Math.floor(page_start / page_size) + 1} /{' '}
                {Math.ceil(results.length / page_size)}
              </span>
              <button
                type="button"
                disabled={!ready || page_start + page_size >= results.length}
                aria-label="Next results"
                onClick={() => select_entry(results[page_start + page_size].id)}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </aside>
          <div className="atlas-mobile-picker">
            <label htmlFor="atlas-place-picker">Choose a work and place</label>
            <select
              id="atlas-place-picker"
              value={entry_id ?? ''}
              disabled={!ready}
              onChange={(event) => select_entry(event.target.value)}
            >
              {results.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {atlas_labels[entry.medium]} · {entry.title} ·{' '}
                  {entry.place_name}
                </option>
              ))}
            </select>
          </div>
          <section
            className="atlas-selected"
            aria-label="Selected place and work"
          >
            <div className="atlas-place-heading">
              <div>
                <p className="atlas-eyebrow">{selected.area}</p>
                <h2 ref={detail_heading} tabIndex={-1}>
                  {selected.place_name}
                </h2>
              </div>
              <SourceLink href={atlas_maps_url(selected)}>
                Google Maps
              </SourceLink>
            </div>
            <div className="atlas-map" key={selected.id}>
              {map_url ? (
                <iframe
                  src={map_url}
                  title={`Google Maps: ${selected.place_name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <p>
                  The map is unavailable.{' '}
                  <SourceLink href={atlas_maps_url(selected)}>
                    Open this place in Google Maps
                  </SourceLink>
                </p>
              )}
            </div>
            <div className="atlas-location-note">
              <strong>{selected.relationship}</strong>
              <p>{selected.precision}</p>
              <p>{selected.visit_note}</p>
            </div>
            <article className="atlas-detail" data-medium={selected.medium}>
              <header className="atlas-work-heading">
                {selected.medium === 'literature' && selected.work.cover && (
                  <figure className="atlas-cover">
                    <AtlasImage
                      key={selected.work.cover.src}
                      src={selected.work.cover.src}
                      alt={selected.work.cover.alt}
                      width={200}
                      height={280}
                    />
                  </figure>
                )}
                {selected.medium === 'music' && (
                  <figure className="atlas-cover atlas-album">
                    <AtlasImage
                      key={selected.track.artwork_url}
                      src={selected.track.artwork_url}
                      alt={`${selected.track.album} by ${selected.creator}`}
                      width={240}
                      height={240}
                    />
                  </figure>
                )}
                <div>
                  <p className="atlas-eyebrow">
                    <MediumIcon medium={selected.medium} />
                    {atlas_labels[selected.medium]} ·{' '}
                    {selected.year ?? 'Year unverified'}
                  </p>
                  <h3>{selected.title}</h3>
                  <p>{selected.creator}</p>
                  {selected.medium === 'music' && (
                    <p className="atlas-caption">
                      {selected.track.album} · {selected.track.genre}
                    </p>
                  )}
                </div>
              </header>
              {selected.medium === 'music' && (
                <div className="atlas-player">
                  <button
                    type="button"
                    className="atlas-play"
                    onClick={() => void toggle_preview()}
                    aria-label={
                      loading
                        ? 'Cancel loading preview'
                        : playing
                          ? 'Pause preview'
                          : `Play preview of ${selected.title}`
                    }
                  >
                    {loading || playing ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                    {loading
                      ? 'Loading preview…'
                      : playing
                        ? 'Pause preview'
                        : 'Play preview'}
                  </button>
                  <progress
                    value={elapsed}
                    max={duration || 1}
                    aria-label="Preview playback progress"
                  />
                  <span>
                    {preview_time(elapsed)} /{' '}
                    {duration ? preview_time(duration) : 'preview'}
                  </span>
                  <output>
                    {message || 'Song preview provided courtesy of iTunes.'}
                  </output>
                  <SourceLink href={selected.track.apple_music_url}>
                    Listen on Apple Music
                  </SourceLink>
                </div>
              )}
              <AtlasStory entry={selected} />
              <Link
                className="atlas-collection-link"
                href={selected.collection_url}
              >
                View in the {atlas_labels[selected.medium].toLowerCase()}{' '}
                collection <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </article>
            {related && related.entries.length > 0 && (
              <section className="atlas-related" aria-label="Related works">
                <h3>{related.label}</h3>
                {related.area && (
                  <p>
                    Related places in this area. Each connection keeps its own
                    location and scope.
                  </p>
                )}
                <div>
                  {related.entries.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => select_entry(entry.id, true)}
                    >
                      <span className="atlas-result-medium">
                        <MediumIcon medium={entry.medium} />
                        {atlas_labels[entry.medium]}
                      </span>
                      <strong>{entry.title}</strong>
                      <span>{entry.place_name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </section>
        </div>
      ) : (
        <section className="atlas-empty">
          <h2>No connections found.</h2>
          <p>
            Try a place, work or creator, or search across all three
            collections.
          </p>
          <button
            type="button"
            onClick={() => update(atlas_location.initial_state)}
          >
            Reset filters
          </button>
        </section>
      )}
      <nav className="atlas-collections" aria-label="Complete collections">
        <span>Explore a collection</span>
        <Link href="/portfolio/nyc-film-map">
          Film scenes <ArrowUpRight size={15} />
        </Link>
        <Link href="/portfolio/nyc-literary-map">
          Literary passages <ArrowUpRight size={15} />
        </Link>
        <Link href="/portfolio/nyc-music-map">
          Music, overview &amp; playlist <ArrowUpRight size={15} />
        </Link>
      </nav>
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audio}
        preload="none"
        aria-label="Song preview"
        {...audio_events}
      />
    </div>
  );
}
