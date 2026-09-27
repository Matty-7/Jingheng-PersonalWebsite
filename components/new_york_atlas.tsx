'use client';

import Link from 'next/link';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  Info,
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
import { AtlasImage, AtlasStory } from './atlas_story';
import { useAtlasDetail } from './use_atlas_detail';
import { useMapLocation } from './use_map_location';
import { useMusicPreview } from './use_music_preview';
import { map_location_url } from '@/lib/map_location';

const AtlasMap = lazy(() =>
  import('./atlas_map').then((module) => ({ default: module.AtlasMap })),
);

export function NewYorkAtlas({
  index,
  initial_detail,
  initial_selection,
}: {
  index: AtlasIndexEntry[];
  initial_detail: AtlasDetail | null;
  initial_selection: AtlasSelection;
}) {
  const codec = useMemo(() => create_atlas_location(index), [index]);
  const { state, update, ready } = useMapLocation(codec, initial_selection);
  const { medium, query, entry_id } = state;
  const results = useMemo(
    () => search_atlas_index(index, medium, query),
    [index, medium, query],
  );
  const summary = results.find((entry) => entry.id === entry_id);
  const { detail, failed, retry, preview_track } = useAtlasDetail(
    entry_id,
    initial_detail,
  );
  const selected = detail?.entry;
  const heading = useRef<HTMLHeadingElement>(null);
  const search_input = useRef<HTMLInputElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const info_button = useRef<HTMLButtonElement>(null);
  const [search_open, set_search_open] = useState(false);
  const [info_id, set_info_id] = useState<string | null>(null);
  const info_open = info_id !== null && info_id === entry_id;
  const { audio, audio_events, playing, loading, message, toggle_preview } =
    useMusicPreview(preview_track);
  const siblings = summary
    ? results.filter((entry) => entry.place_key === summary.place_key)
    : [];
  const select_entry = useCallback(
    (id: string) => {
      origin.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      set_search_open(false);
      update((previous) => ({ ...previous, entry_id: id }));
      requestAnimationFrame(() =>
        heading.current?.focus({ preventScroll: true }),
      );
    },
    [update, set_search_open],
  );
  const close_card = useCallback(() => {
    update({ ...state, entry_id: null });
    if (origin.current?.isConnected)
      origin.current.focus({ preventScroll: true });
    else document.getElementById('atlas-map')?.focus({ preventScroll: true });
  }, [update, state]);
  useEffect(() => {
    if (info_open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [info_open]);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || info_open) return;
      if (search_open) {
        set_search_open(false);
        search_input.current?.focus();
      } else if (entry_id) close_card();
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [info_open, search_open, entry_id, close_card]);
  const artwork =
    selected?.medium === 'film'
      ? selected.scene.still
      : selected?.medium === 'literature'
        ? selected.work.cover && {
            ...selected.work.cover,
            width: 300,
            height: 450,
          }
        : selected?.medium === 'music'
          ? {
              src: selected.track.artwork_url,
              alt: `${selected.track.album} cover`,
              width: 300,
              height: 300,
            }
          : null;
  const description =
    selected?.medium === 'film'
      ? selected.scene.scene
      : selected?.medium === 'literature'
        ? selected.passage.excerpt
        : selected?.medium === 'music'
          ? (detail?.connection?.note ?? selected.track.note)
          : '';
  const selection_url =
    typeof window === 'undefined'
      ? ''
      : map_location_url(window.location.href, codec.keys, codec.write(state))
          .href;

  return (
    <div className="atlas-explorer">
      <header className="atlas-toolbar">
        <div className="atlas-brand">
          <Link
            href="/#projects"
            prefetch={false}
            aria-label="Back to projects"
          >
            <ChevronLeft size={22} />
          </Link>
          <h1>
            New York <em>Atlas.</em>
          </h1>
        </div>
        <fieldset className="atlas-filters">
          <legend className="sr-only">Content type</legend>
          {(['all', 'film', 'music', 'literature'] as AtlasFilter[]).map(
            (value) => (
              <button
                type="button"
                key={value}
                aria-pressed={medium === value}
                disabled={!ready}
                onClick={() => {
                  set_search_open(false);
                  update({ ...state, medium: value, entry_id: null });
                }}
              >
                {atlas_labels[value]}
              </button>
            ),
          )}
        </fieldset>
        <div
          className="atlas-search-wrap"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              set_search_open(false);
          }}
        >
          <div className="atlas-search">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="atlas-search">
              Search the atlas
            </label>
            <input
              ref={search_input}
              id="atlas-search"
              type="search"
              value={query}
              disabled={!ready}
              aria-controls={
                search_open && query ? 'atlas-search-results' : undefined
              }
              onFocus={() => set_search_open(true)}
              onChange={(event) => {
                set_search_open(true);
                update(
                  { ...state, query: event.target.value, entry_id: null },
                  'replace',
                );
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && results.length && query) {
                  event.preventDefault();
                  select_entry(results[0].id);
                }
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  document
                    .querySelector<HTMLButtonElement>(
                      '#atlas-search-results button',
                    )
                    ?.focus();
                }
              }}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  update({ ...state, query: '', entry_id: null }, 'replace');
                  search_input.current?.focus();
                }}
              >
                <X size={17} />
              </button>
            )}
          </div>
          {search_open && query && results.length > 0 && (
            <div
              className="atlas-search-results"
              id="atlas-search-results"
              aria-label="Search results"
            >
              {results.slice(0, 8).map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  onClick={() => select_entry(entry.id)}
                >
                  <strong>{entry.place_name}</strong>
                  <span>
                    {entry.title} · {entry.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <div className="atlas-canvas">
        {ready ? (
          <Suspense
            fallback={
              <output className="atlas-map-status">Loading map…</output>
            }
          >
            <AtlasMap
              entries={results}
              selected_id={entry_id}
              on_select={select_entry}
            />
          </Suspense>
        ) : (
          <div className="atlas-map" />
        )}
        <output className="sr-only">
          {results.length} connections on the map.
        </output>
        {!results.length && (
          <section className="atlas-empty">
            <h2>No connections found.</h2>
            <button type="button" onClick={() => update(codec.initial_state)}>
              Reset filters
            </button>
          </section>
        )}
        {summary && (
          <article
            className="atlas-card atlas-detail"
            data-medium={summary.medium}
            aria-label="Selected place and work"
            aria-busy={!detail && !failed}
          >
            {artwork?.src && (
              <AtlasImage
                key={artwork.src}
                {...artwork}
                class_name={`atlas-artwork atlas-artwork-${summary.medium}`}
              />
            )}
            <div className="atlas-card-copy">
              <p className="atlas-eyebrow">
                {summary.label}
                {detail && <> · {detail.year}</>}
                {detail?.connection && <> · Artist connection</>}
              </p>
              <h2 ref={heading} tabIndex={-1}>
                {summary.place_name}
              </h2>
              {siblings.length > 1 ? (
                <select
                  aria-label="Works at this place"
                  value={entry_id ?? ''}
                  onChange={(event) => select_entry(event.target.value)}
                >
                  {siblings.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.title}
                    </option>
                  ))}
                </select>
              ) : (
                <h3>{summary.title}</h3>
              )}
              {detail ? (
                <p className="atlas-card-description">{description}</p>
              ) : (
                <output className="atlas-loading">
                  {failed ? (
                    <>
                      Details unavailable.{' '}
                      <button
                        type="button"
                        aria-label="Retry loading details"
                        onClick={retry}
                      >
                        Retry
                      </button>{' '}
                      <a href={selection_url}>Open this selection as a page</a>
                    </>
                  ) : (
                    'Loading details…'
                  )}
                </output>
              )}
              {selected && selected.medium !== 'film' && (
                <p className="atlas-scope">{selected.precision}</p>
              )}
            </div>
            <div className="atlas-card-actions">
              <button
                className="atlas-close atlas-icon-button"
                type="button"
                aria-label="Close place card"
                disabled={!ready}
                onClick={close_card}
              >
                <X size={20} />
              </button>
              {detail && (
                <>
                  <a
                    className="atlas-action"
                    href={detail.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open in Google Maps"
                  >
                    Google Maps <ArrowUpRight size={15} />
                  </a>
                  {selected?.medium === 'music' && (
                    <div className="atlas-player">
                      <button
                        type="button"
                        className="atlas-action"
                        disabled={!ready}
                        aria-label={
                          loading
                            ? 'Cancel loading preview'
                            : playing
                              ? 'Pause preview'
                              : `Play preview of ${selected.title}`
                        }
                        onClick={() => void toggle_preview()}
                      >
                        {playing || loading ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}{' '}
                        {loading ? 'Loading…' : playing ? 'Pause' : 'Preview'}
                      </button>
                      {message && (
                        <output>
                          {message}{' '}
                          <a
                            href={selected.track.apple_music_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Listen on Apple Music
                          </a>
                        </output>
                      )}
                    </div>
                  )}
                  <button
                    ref={info_button}
                    className="atlas-info atlas-icon-button"
                    type="button"
                    aria-label="Sources and place details"
                    disabled={!ready}
                    onClick={() => set_info_id(entry_id)}
                  >
                    <Info size={19} />
                  </button>
                </>
              )}
            </div>
          </article>
        )}
        <noscript>
          <style>{`html:has(.atlas-page),body:has(.atlas-page){height:auto;overflow:auto}.atlas-page{height:auto;min-height:100vh}.atlas-canvas{padding:20px}.atlas-map{display:none}.atlas-card{position:relative;left:auto;bottom:auto;transform:none;margin:0 auto 20px;max-height:none}.atlas-noscript{position:relative;inset:auto;margin:auto;max-width:600px}`}</style>
          <div className="atlas-noscript">
            <form action="/portfolio/new-york-atlas" method="get">
              <label htmlFor="atlas-static-entry">
                Choose a place and work
              </label>
              <select
                id="atlas-static-entry"
                name="entry"
                defaultValue={entry_id ?? ''}
              >
                <option value="">Choose a place</option>
                {index.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.place_name} · {entry.title}
                  </option>
                ))}
              </select>
              <button type="submit">Open</button>
            </form>
            {detail && (
              <section className="atlas-info-body">
                <h2>Sources &amp; place details</h2>
                <p>
                  {detail.credit} · {detail.year}
                </p>
                <p>
                  {detail.entry.relationship} · {detail.entry.precision}
                </p>
                <p>{detail.entry.visit_note}</p>
                <AtlasStory detail={detail} />
              </section>
            )}
          </div>
        </noscript>
      </div>
      <dialog
        ref={dialog}
        className="atlas-info-dialog"
        aria-labelledby="atlas-info-title"
        onClose={() => {
          set_info_id(null);
          info_button.current?.focus();
        }}
      >
        <div className="atlas-info-heading">
          <h2 id="atlas-info-title">Sources &amp; place details</h2>
          <button
            type="button"
            className="atlas-icon-button"
            aria-label="Close details"
            onClick={() => set_info_id(null)}
          >
            <X size={20} />
          </button>
        </div>
        {detail && (
          <div className="atlas-info-body">
            <h3>{detail.entry.title}</h3>
            <p>
              {detail.credit} · {detail.year}
            </p>
            <p>
              {detail.entry.relationship} · {detail.entry.precision}
            </p>
            <p>{detail.entry.visit_note}</p>
            <AtlasStory detail={detail} />
            {selected?.medium === 'music' && (
              <a
                href={selected.track.apple_music_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Listen on Apple Music
              </a>
            )}
          </div>
        )}
      </dialog>
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
