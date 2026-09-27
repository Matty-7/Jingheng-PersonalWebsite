'use client';

import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
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
  atlas_labels,
  create_atlas_location,
  search_atlas_index,
  type AtlasDetail,
  type AtlasIndexEntry,
  type AtlasFilter,
  type AtlasSelection,
} from '@/lib/atlas_browser';
import type { AtlasEntry } from '@/lib/new_york_atlas';
import { useAtlasDetail } from './use_atlas_detail';
import { useMapLocation } from './use_map_location';
import { useMusicPreview } from './use_music_preview';
import { preview_time } from '@/lib/preview_time';
import { map_location_url } from '@/lib/map_location';

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
  aria_label,
  children,
}: {
  href: string;
  aria_label?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={aria_label}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children} <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

const AtlasStory = memo(function AtlasStory({
  detail,
}: {
  detail: AtlasDetail;
}) {
  const { entry, connection, sources } = detail;
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
                {scene.still.kind ? 'Image source' : 'Frame source'}
              </SourceLink>
            </figcaption>
          </figure>
        )}
        <p>{scene.scene}</p>
        <details className="atlas-notes">
          <summary>Scene sources</summary>
          <div className="atlas-sources">
            {scene.source_ids.map((id) => {
              const source = sources.find((item) => item.id === id);
              return source ? (
                <SourceLink key={id} href={source.url}>
                  {source.label}
                </SourceLink>
              ) : null;
            })}
          </div>
        </details>
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
  const { track } = entry;
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
});

const page_size = 10;

const AtlasResults = memo(function AtlasResults({
  results,
  entry_id,
  ready,
  select_entry,
}: {
  results: AtlasIndexEntry[];
  entry_id: string | null;
  ready: boolean;
  select_entry: (id: string) => void;
}) {
  const selected_index = Math.max(
    0,
    results.findIndex((entry) => entry.id === entry_id),
  );
  const page_start = Math.floor(selected_index / page_size) * page_size;
  const visible_results = results.slice(page_start, page_start + page_size);
  return (
    <>
      <aside className="atlas-index" aria-label="Atlas results">
        <div className="atlas-index-heading">
          <span>Places &amp; works</span>
          <span>
            {page_start + 1}–{Math.min(page_start + page_size, results.length)}
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
              <span className="atlas-result-icon" aria-hidden="true">
                <MediumIcon medium={entry.medium} />
              </span>
              <span className="atlas-result-copy">
                <span className="sr-only">{entry.label}: </span>
                <strong>{entry.place_name}</strong>
                <span>{entry.title}</span>
              </span>
              {entry.id === entry_id && (
                <Check
                  className="atlas-selected-check"
                  size={16}
                  aria-hidden="true"
                />
              )}
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
        <label className="sr-only" htmlFor="atlas-place-picker">
          Choose a work and place
        </label>
        <select
          id="atlas-place-picker"
          value={entry_id ?? ''}
          disabled={!ready}
          onChange={(event) => select_entry(event.target.value)}
        >
          {results.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.place_name} · {entry.title} · {entry.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
});

export function NewYorkAtlas({
  index,
  counts,
  initial_detail,
  initial_selection,
}: {
  index: AtlasIndexEntry[];
  counts: Record<Exclude<AtlasFilter, 'all'>, number>;
  initial_detail: AtlasDetail | null;
  initial_selection: AtlasSelection;
}) {
  const atlas_location = useMemo(() => create_atlas_location(index), [index]);
  const { state, update, ready } = useMapLocation(
    atlas_location,
    initial_selection,
  );
  const { medium, query, entry_id } = state;
  const results = useMemo(
    () => search_atlas_index(index, medium, query),
    [index, medium, query],
  );
  const summary = results.find((entry) => entry.id === entry_id);
  const { detail, failed, retry } = useAtlasDetail(entry_id, initial_detail);
  const selected = detail?.entry;
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
  const map_url = detail?.map_url;
  const related = detail?.related;

  const select_entry = useCallback(
    (id: string, related_entry = false) => {
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
    },
    [state, update],
  );

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
                    ? counts.film + counts.literature + counts.music
                    : counts[value]}
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
          {query ? ` matching “${query}”` : ''}
        </output>
      </div>
      {summary ? (
        <div className="atlas-workspace">
          <AtlasResults
            results={results}
            entry_id={entry_id}
            ready={ready}
            select_entry={select_entry}
          />
          <section
            className="atlas-selected"
            aria-label="Selected place and work"
          >
            <div className="atlas-place-heading">
              <div>
                <p className="atlas-eyebrow">{summary.area}</p>
                <h2 ref={detail_heading} tabIndex={-1}>
                  {summary.place_name}
                </h2>
              </div>
              {detail && (
                <SourceLink
                  href={detail.maps_url}
                  aria_label="Open in Google Maps"
                >
                  Maps
                </SourceLink>
              )}
            </div>
            <div
              className="atlas-map"
              key={summary.id}
              aria-busy={!detail && !failed}
            >
              {!detail ? (
                <div className="atlas-loading">
                  <strong>{summary.title}</strong>
                  {failed ? (
                    <>
                      <output>Details could not be loaded.</output>
                      <button type="button" onClick={retry}>
                        Retry loading details
                      </button>
                      <a
                        href={
                          map_location_url(
                            window.location.href,
                            atlas_location.keys,
                            atlas_location.write(state),
                          ).href
                        }
                        onClick={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey
                          )
                            return;
                          // A same-document hash link would only scroll. Reload
                          // explicitly so the server can recover this selection.
                          event.preventDefault();
                          window.location.reload();
                        }}
                      >
                        Open this selection as a page
                      </a>
                    </>
                  ) : (
                    <output>Loading details…</output>
                  )}
                </div>
              ) : map_url ? (
                <iframe
                  src={map_url}
                  title={`Google Maps: ${summary.place_name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <p>
                  The map is unavailable.{' '}
                  <SourceLink href={detail.maps_url}>
                    Open this place in Google Maps
                  </SourceLink>
                </p>
              )}
            </div>
            {selected && detail && (
              <>
                <div className="atlas-location-note">
                  <div>
                    <strong>{selected.relationship}</strong>
                    <p>{selected.precision}</p>
                  </div>
                  <details className="atlas-visiting" key={selected.id}>
                    <summary>Visiting notes</summary>
                    <p>{selected.visit_note}</p>
                  </details>
                </div>
                <article className="atlas-detail" data-medium={selected.medium}>
                  <header className="atlas-work-heading">
                    {selected.medium === 'literature' &&
                      selected.work.cover && (
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
                        {detail.label} · {detail.year}
                      </p>
                      <h3>{selected.title}</h3>
                      <p>{detail.credit}</p>
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
                        <span className="sr-only">
                          {loading
                            ? 'Loading preview…'
                            : playing
                              ? 'Pause preview'
                              : 'Play preview'}
                        </span>
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
                  <AtlasStory detail={detail} />
                  <Link
                    prefetch={false}
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
                    {related.area && <p>Works connected to nearby places.</p>}
                    <div>
                      {related.entries.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => select_entry(entry.id, true)}
                        >
                          <span className="atlas-result-medium">
                            <MediumIcon medium={entry.medium} />
                            {entry.label}
                          </span>
                          <strong>{entry.title}</strong>
                          <span>{entry.place_name}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </>
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
        <Link prefetch={false} href="/portfolio/nyc-film-map">
          Film &amp; TV scenes <ArrowUpRight size={15} />
        </Link>
        <Link prefetch={false} href="/portfolio/nyc-literary-map">
          Literary passages <ArrowUpRight size={15} />
        </Link>
        <Link prefetch={false} href="/portfolio/nyc-music-map">
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
