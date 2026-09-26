'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMapLocation } from './use_map_location';
import { film_location } from '@/lib/nyc_film_location';
import Image from 'next/image';
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  MapPin,
  Pause,
  Play,
  Search,
  X,
} from 'lucide-react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { useAlbumScroll } from '@/components/use_album_scroll';
import {
  google_film_embed_url,
  google_maps_url,
  film_catalog,
  film_locations,
  film_sources,
  search_locations,
  type FilmLocation,
  type FilmScene,
} from '@/lib/nyc_film_map';

function SceneStill({
  scene,
  thumbnail = false,
}: {
  scene: FilmScene;
  thumbnail?: boolean;
}) {
  const [failed, set_failed] = useState(false);
  if (!scene.still || failed)
    return (
      <span className="cinema-image-fallback">
        <Film size={22} aria-hidden="true" />
        <span>
          {thumbnail
            ? 'Scene reference'
            : !scene.still
              ? 'Filming location verified. A matching frame has not yet been confirmed.'
              : 'Image unavailable. The filming reference is linked below.'}
        </span>
      </span>
    );
  return (
    <Image
      src={thumbnail ? scene.still.thumbnail : scene.still.src}
      alt={thumbnail ? '' : scene.still.alt}
      width={scene.still.width}
      height={scene.still.height}
      unoptimized
      loading="lazy"
      onError={() => set_failed(true)}
    />
  );
}

function SceneDetails({
  location,
  film_id,
}: {
  location: FilmLocation;
  film_id: string;
}) {
  const scenes = location.scenes.filter(
    (scene) => film_id === 'all' || scene.film_id === film_id,
  );
  return (
    <div className="cinema-details">
      {scenes.map((scene) => {
        const film = film_catalog.find((item) => item.id === scene.film_id)!;
        return (
          <div className="cinema-scene" key={scene.film_id}>
            <figure className="cinema-still">
              <SceneStill scene={scene} />
              {scene.still && (
                <figcaption>
                  <span>{scene.still.credit}</span>
                  <a
                    href={scene.still.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Frame source <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                </figcaption>
              )}
            </figure>
            <div className="cinema-scene-copy">
              <p className="cinema-film-label">
                {film.title}{' '}
                <span>
                  {film.year} · {film.director}
                </span>
              </p>
              <p>{scene.scene}</p>
              <div className="cinema-sources">
                {scene.source_ids.map((source_id) => {
                  const source = film_sources.find(
                    (item) => item.id === source_id,
                  )!;
                  return (
                    <a
                      key={source_id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.label}
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div className="cinema-visit-info">
        <p className="cinema-address">
          <MapPin size={16} aria-hidden="true" />
          {location.address}
        </p>
        <p className="cinema-visit">
          <strong>{location.access}</strong> · {location.visit_note}
        </p>
        <a
          className="cinema-google-link"
          href={google_maps_url(location)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Google Maps <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function NycFilmMap({ google_maps_key }: { google_maps_key: string }) {
  const { state, update, ready: interactive } = useMapLocation(film_location);
  const { film_id, query, selected_id } = state;
  const [collapsed_selection, set_collapsed_selection] = useState<
    typeof state | null
  >(null);
  const [map_reload, set_map_reload] = useState(0);
  const map_panel = useRef<HTMLElement>(null);
  const filmstrip_element = useRef<HTMLDivElement>(null);
  const shelf_motion = useAlbumScroll(filmstrip_element, query);
  const details_elements = useRef(new Map<string, HTMLElement>());
  const reveal_selection = useRef(false);
  const filtered_locations = useMemo(
    () => search_locations(film_id, query),
    [film_id, query],
  );
  const selected_location =
    filtered_locations.find((location) => location.id === selected_id) ??
    filtered_locations[0];
  const selected_index = filtered_locations.indexOf(selected_location);
  const embed_url = selected_location
    ? google_film_embed_url(selected_location, google_maps_key)
    : null;
  const selected_film = film_catalog.find((film) => film.id === film_id);
  const matching_films = new Set(
    filtered_locations.flatMap((location) =>
      location.scenes.map((scene) => scene.film_id),
    ),
  );
  const strip_films = query.trim()
    ? film_catalog.filter((film) => matching_films.has(film.id))
    : film_catalog;
  const reduce_motion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function select_location(location_id: string, reveal = false) {
    reveal_selection.current = reveal;
    update((previous) => ({ ...previous, selected_id: location_id }));
  }

  function close_location() {
    set_collapsed_selection(state);
  }

  function change_query(next_query: string) {
    update({ query: next_query, film_id: 'all', selected_id: null }, 'replace');
  }

  useEffect(() => {
    if (!state.selected_id || !reveal_selection.current) return;
    reveal_selection.current = false;
    const details = details_elements.current.get(state.selected_id);
    details?.focus({ preventScroll: true });
    details?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [state]);

  function choose_film(next_id: string) {
    update({ selected_id: null, query: '', film_id: next_id });
  }

  function scroll_films(direction: number) {
    shelf_motion.defer();
    filmstrip_element.current?.scrollBy({
      left: direction * 420,
      behavior: reduce_motion() ? 'instant' : 'smooth',
    });
  }

  return (
    <>
      <section className="cinema-picker" aria-label="Choose a film">
        <div className="cinema-controls">
          <div className="cinema-collection-label">
            <Film size={18} aria-hidden="true" />
            <span>THE COLLECTION</span>
            <small>
              {film_catalog.length} films · {film_locations.length} places
            </small>
          </div>
          <label className="cinema-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search films, directors or places</span>
            <input
              type="search"
              disabled={!interactive}
              value={query}
              placeholder="Film, director or place"
              onChange={(event) => change_query(event.target.value)}
            />
            {query && (
              <button
                disabled={!interactive}
                aria-label="Clear search"
                onClick={() => update({ ...state, query: '' })}
              >
                <X size={17} />
              </button>
            )}
          </label>
          <div className="cinema-strip-arrows">
            <button
              disabled={!interactive || shelf_motion.reduced}
              aria-label={
                shelf_motion.scrolling
                  ? 'Pause film scrolling'
                  : 'Resume film scrolling'
              }
              onClick={shelf_motion.toggle}
            >
              {shelf_motion.scrolling ? (
                <Pause size={17} />
              ) : (
                <Play size={17} />
              )}
            </button>
            <button
              disabled={!interactive}
              aria-label="Previous films"
              onClick={() => scroll_films(-1)}
            >
              <ChevronLeft size={19} />
            </button>
            <button
              disabled={!interactive}
              aria-label="More films"
              onClick={() => scroll_films(1)}
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
        <div className="cinema-filmstrip" ref={filmstrip_element}>
          <button
            disabled={!interactive}
            className="cinema-all-films"
            aria-label="All films"
            aria-pressed={film_id === 'all'}
            onClick={() => choose_film('all')}
          >
            <span className="cinema-all-art">
              <Film size={26} strokeWidth={1.2} />
              <span>
                NEW YORK
                <br />
                <em>on film.</em>
              </span>
            </span>
            <span className="cinema-film-card-label">
              All films <small>{film_catalog.length}</small>
            </span>
            <span className="cinema-film-card-count">
              {film_locations.length} places
            </span>
            {film_id === 'all' && (
              <Check
                className="cinema-film-check"
                size={16}
                aria-hidden="true"
              />
            )}
          </button>
          {strip_films.map((film) => {
            const place_count = film_locations.filter((location) =>
              location.scenes.some((scene) => scene.film_id === film.id),
            ).length;
            const scene = film_locations
              .flatMap((location) => location.scenes)
              .find((scene) => scene.film_id === film.id && scene.still);
            return (
              <button
                disabled={!interactive}
                className="cinema-film-card"
                key={film.id}
                aria-label={`${film.title} ${film.year}`}
                aria-pressed={film_id === film.id}
                onClick={() => choose_film(film.id)}
              >
                <span className="cinema-film-card-image">
                  {scene ? (
                    <SceneStill scene={scene} thumbnail />
                  ) : (
                    <span className="cinema-film-year">{film.year}</span>
                  )}
                </span>
                <span className="cinema-film-card-label">
                  {film.title}
                  <small>{film.year}</small>
                </span>
                <span className="cinema-film-card-count">
                  {place_count} {place_count === 1 ? 'place' : 'places'}
                </span>
                {film_id === film.id && (
                  <Check
                    className="cinema-film-check"
                    size={16}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>
      <div className="cinema-workspace">
        <section
          className="cinema-map-panel"
          aria-label="Filming location map"
          ref={map_panel}
          tabIndex={-1}
        >
          <div className="cinema-map-toolbar">
            <span>
              <span className="cinema-map-eyebrow">
                GOOGLE MAPS · SELECTED PLACE
              </span>
              <strong aria-live="polite">
                {selected_location?.name ?? 'No matching places'}
              </strong>
            </span>
            {selected_location && (
              <button
                disabled={!interactive}
                onClick={() => select_location(selected_location.id, true)}
              >
                View scene <ChevronRight size={17} aria-hidden="true" />
              </button>
            )}
          </div>
          {selected_location ? (
            <>
              <div className="cinema-place-navigation">
                <label htmlFor="cinema-map-place">
                  Choose a filming location
                </label>
                <div className="cinema-place-controls">
                  <NativeSelect
                    className="cinema-place-select"
                    id="cinema-map-place"
                    value={selected_location.id}
                    disabled={!interactive}
                    onChange={(event) => select_location(event.target.value)}
                  >
                    {filtered_locations.map((location, index) => (
                      <NativeSelectOption key={location.id} value={location.id}>
                        {index + 1}. {location.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <button
                    aria-label="Previous filming location"
                    disabled={!interactive || selected_index <= 0}
                    onClick={() =>
                      select_location(filtered_locations[selected_index - 1].id)
                    }
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Next filming location"
                    disabled={
                      !interactive ||
                      selected_index >= filtered_locations.length - 1
                    }
                    onClick={() =>
                      select_location(filtered_locations[selected_index + 1].id)
                    }
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="cinema-map">
                {embed_url ? (
                  <iframe
                    key={`${selected_location.id}:${map_reload}`}
                    className="cinema-google-map"
                    title={`Google Maps: ${selected_location.name}`}
                    src={embed_url}
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <p className="cinema-map-fallback">
                    The map is unavailable. Open this location in Google Maps
                    below.
                  </p>
                )}
              </div>
              <div className="cinema-map-caption">
                <span>
                  {selected_index + 1} of {filtered_locations.length} filming
                  locations
                </span>
                {embed_url && (
                  <button onClick={() => set_map_reload((value) => value + 1)}>
                    Reload map
                  </button>
                )}
              </div>
              <div className="cinema-map-destination">
                <p>
                  <MapPin size={16} aria-hidden="true" />
                  {selected_location.address} · {selected_location.borough}
                </p>
                <a
                  className="cinema-google-link"
                  href={google_maps_url(selected_location)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps{' '}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
            </>
          ) : (
            <p className="cinema-map-fallback">
              Choose another film or clear your search to find a location.
            </p>
          )}
        </section>
        <aside className="cinema-places" aria-label="Film locations">
          <div className="cinema-list-heading">
            <p className="cinema-kicker">
              {selected_film
                ? `${selected_film.year} / ${selected_film.director}`
                : 'SCENES IN THE CITY'}
            </p>
            <h2>
              {selected_film?.title ??
                (query ? `Results for “${query}”` : 'Find your scene.')}
            </h2>
            <p>{selected_film?.note ?? 'Real places. Familiar frames.'}</p>
          </div>
          {!filtered_locations.length && (
            <div className="cinema-empty">
              <p>No places match this search.</p>
              <button
                disabled={!interactive}
                onClick={() => choose_film('all')}
              >
                Explore all films
              </button>
            </div>
          )}
          <ol className="cinema-place-list">
            {filtered_locations.map((location, index) => {
              const scenes = location.scenes.filter(
                (scene) => film_id === 'all' || scene.film_id === film_id,
              );
              const preview_scene =
                scenes.find((scene) => scene.still) ?? scenes[0];
              const titles = scenes
                .map(
                  (scene) =>
                    film_catalog.find((film) => film.id === scene.film_id)!
                      .title,
                )
                .join(' · ');
              const selected =
                selected_id === location.id && collapsed_selection !== state;
              return (
                <li key={location.id} className={selected ? 'is-selected' : ''}>
                  <details className="cinema-location" open={selected}>
                    <summary
                      className="cinema-place-button"
                      aria-label={`${String(index + 1).padStart(2, '0')} ${location.name} · ${titles}`}
                      onClick={(event) => {
                        event.preventDefault();
                        if (selected) close_location();
                        else select_location(location.id, false);
                      }}
                    >
                      <span className="cinema-place-thumbnail">
                        <SceneStill scene={preview_scene} thumbnail />
                        <span>{String(index + 1).padStart(2, '0')}</span>
                      </span>
                      <span className="cinema-place-copy">
                        <strong>{location.name}</strong>
                        <span>{titles}</span>
                        <small>
                          {location.neighborhood} · {location.borough}
                        </small>
                      </span>
                      <ChevronRight
                        className="cinema-place-chevron"
                        size={17}
                        aria-hidden="true"
                      />
                    </summary>
                    <section
                      className="cinema-selected"
                      aria-label={`Details for ${location.name}`}
                      tabIndex={-1}
                      ref={(element) => {
                        if (element)
                          details_elements.current.set(location.id, element);
                        else details_elements.current.delete(location.id);
                      }}
                    >
                      <div className="cinema-selected-title">
                        <h3>{location.name}</h3>
                        <button
                          aria-label={`Show ${location.name} on map`}
                          onClick={() => {
                            map_panel.current?.focus({ preventScroll: true });
                            map_panel.current?.scrollIntoView({
                              block: 'start',
                              behavior: 'instant',
                            });
                          }}
                        >
                          <MapPin size={17} aria-hidden="true" />
                        </button>
                        <button
                          aria-label="Close location details"
                          onClick={() => {
                            close_location();
                            details_elements.current
                              .get(location.id)
                              ?.parentElement?.querySelector('summary')
                              ?.focus();
                          }}
                        >
                          <X size={17} />
                        </button>
                      </div>
                      <SceneDetails location={location} film_id={film_id} />
                    </section>
                  </details>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </>
  );
}
