'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Film, MapPin, Maximize2, Search, X } from 'lucide-react';
import type * as Leaflet from 'leaflet';
import { google_film_embed_url, google_maps_url, film_catalog, film_locations, film_sources, search_locations, type FilmLocation, type FilmScene } from '@/lib/nyc_film_map';

type MapState = { active: boolean; leaflet: typeof Leaflet; map: Leaflet.Map; layer: Leaflet.LayerGroup; markers: Map<string, Leaflet.Marker> };

function SceneStill({ scene, thumbnail = false }: { scene: FilmScene; thumbnail?: boolean }) {
  const [failed, set_failed] = useState(false);
  if (!scene.still || failed) return <span className="cinema-image-fallback"><Film size={22} aria-hidden="true" /><span>{thumbnail ? 'Scene reference' : !scene.still ? 'Filming location verified. A matching frame has not yet been confirmed.' : 'Image unavailable. The filming reference is linked below.'}</span></span>;
  return <Image src={thumbnail ? scene.still.thumbnail : scene.still.src} alt={thumbnail ? '' : scene.still.alt} width={scene.still.width} height={scene.still.height} unoptimized loading="lazy" onError={() => set_failed(true)} />;
}

function SceneDetails({ location, film_id, selected, google_maps_key }: { location: FilmLocation; film_id: string; selected: boolean; google_maps_key: string }) {
  const embed_url = selected ? google_film_embed_url(location, google_maps_key) : null;
  const scenes = location.scenes.filter((scene) => film_id === 'all' || scene.film_id === film_id);
  return <div className="cinema-details">
    {scenes.map((scene) => {
      const film = film_catalog.find((item) => item.id === scene.film_id)!;
      return <div className="cinema-scene" key={scene.film_id}>
        <figure className="cinema-still"><SceneStill scene={scene} />{scene.still && <figcaption><span>{scene.still.credit}</span><a href={scene.still.source_url} target="_blank" rel="noopener noreferrer">Frame source <ArrowUpRight size={12} aria-hidden="true" /></a></figcaption>}</figure>
        <div className="cinema-scene-copy"><p className="cinema-film-label">{film.title} <span>{film.year} · {film.director}</span></p><p>{scene.scene}</p>
          <div className="cinema-sources">{scene.source_ids.map((source_id) => {
            const source = film_sources.find((item) => item.id === source_id)!;
            return <a key={source_id} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={12} aria-hidden="true" /></a>;
          })}</div>
        </div>
      </div>;
    })}
    <div className="cinema-visit-info"><p className="cinema-address"><MapPin size={16} aria-hidden="true" />{location.address}</p><p className="cinema-visit"><strong>{location.access}</strong> · {location.visit_note}</p>{embed_url && <iframe className="cinema-google-map" title={`Google Maps: ${location.name}`} src={embed_url} referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}<a className="cinema-google-link" href={google_maps_url(location)} target="_blank" rel="noopener noreferrer">Open in Google Maps <ArrowUpRight size={17} aria-hidden="true" /></a></div>
  </div>;
}

// Keep React-only controls inactive until their event handlers can receive input.
const subscribe_to_readiness = () => () => {};
const client_ready = () => true;
const server_ready = () => false;

export function NycFilmMap({ google_maps_key }: { google_maps_key: string }) {
  const interactive = useSyncExternalStore(subscribe_to_readiness, client_ready, server_ready);
  const [film_id, set_film_id] = useState('all');
  const [query, set_query] = useState('');
  const [selected_id, set_selected_id] = useState<string | null>(null);
  const [map_state, set_map_state] = useState<MapState | null>(null);
  const [map_status, set_map_status] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry_count, set_retry_count] = useState(0);
  const map_element = useRef<HTMLDivElement>(null);
  const filmstrip_element = useRef<HTMLDivElement>(null);
  const details_elements = useRef(new Map<string, HTMLElement>());
  const reveal_selection = useRef(false);
  const initial_fit = useRef(true);
  const filtered_locations = useMemo(() => search_locations(film_id, query), [film_id, query]);
  const selected_film = film_catalog.find((film) => film.id === film_id);
  const matching_films = new Set(filtered_locations.flatMap((location) => location.scenes.map((scene) => scene.film_id)));
  const strip_films = query.trim() ? film_catalog.filter((film) => matching_films.has(film.id)) : film_catalog;
  const reduce_motion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const select_location = useCallback((location_id: string, reveal = true) => {
    reveal_selection.current = reveal;
    set_selected_id(location_id);
  }, []);

  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | undefined;
    let instance: MapState | undefined;
    let resize_observer: ResizeObserver | undefined;
    let load_timeout: ReturnType<typeof setTimeout> | undefined;
    import('leaflet').then(async (leaflet_module) => {
      const leaflet = leaflet_module.default ?? leaflet_module;
      await import('leaflet.markercluster');
      if (disposed || !map_element.current) return;
      const reduced = reduce_motion();
      map = leaflet.map(map_element.current, {
        center: [40.75, -73.98], zoom: 12, minZoom: 10, maxZoom: 19,
        scrollWheelZoom: false, zoomControl: false, zoomAnimation: false,
        fadeAnimation: !reduced, markerZoomAnimation: !reduced,
      });
      leaflet.control.zoom({ position: 'bottomright' }).addTo(map);
      const tiles = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19,
      });
      let loaded_tiles = 0;
      tiles.on('loading', () => {
        loaded_tiles = 0;
        clearTimeout(load_timeout);
        load_timeout = setTimeout(() => { if (!disposed && !loaded_tiles) set_map_status('error'); }, 12000);
      });
      tiles.on('tileload', () => { loaded_tiles += 1; if (!disposed) set_map_status('ready'); });
      tiles.on('load', () => { clearTimeout(load_timeout); if (!disposed) set_map_status(loaded_tiles ? 'ready' : 'error'); });
      tiles.addTo(map);
      const layer = leaflet.layerGroup().addTo(map);
      instance = { active: true, leaflet, map, layer, markers: new Map() };
      initial_fit.current = true;
      set_map_state(instance);
      resize_observer = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
      resize_observer.observe(map_element.current);
    }).catch(() => { if (!disposed) set_map_status('error'); });
    return () => {
      disposed = true;
      if (instance) instance.active = false;
      clearTimeout(load_timeout);
      resize_observer?.disconnect();
      map?.remove();
    };
  }, [retry_count]);

  useEffect(() => {
    if (!map_state?.active) return;
    const { leaflet, map, markers } = map_state;
    map.stop();
    markers.forEach((marker) => marker.closeTooltip());
    map_state.layer.clearLayers();
    const layer = filtered_locations.length > 8 ? leaflet.markerClusterGroup({
      maxClusterRadius: 64, disableClusteringAtZoom: 16, showCoverageOnHover: false, animate: !reduce_motion(),
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        cluster.options.title = `${count} filming locations. Zoom to expand.`;
        const icon = leaflet.divIcon({ className: 'cinema-cluster', html: `<span aria-hidden="true">${count}<small>places</small></span>`, iconSize: [48, 48], iconAnchor: [24, 24] });
        const create_icon = icon.createIcon.bind(icon);
        icon.createIcon = (old_icon) => {
          const element = create_icon(old_icon);
          element.setAttribute('aria-label', cluster.options.title!);
          return element;
        };
        return icon;
      },
    }) : leaflet.layerGroup();
    layer.on('clusterkeydown', (event) => {
      const cluster_event = event as Leaflet.LeafletKeyboardEvent & { propagatedFrom: Leaflet.MarkerCluster };
      if (cluster_event.originalEvent.key !== ' ') return;
      leaflet.DomEvent.stop(cluster_event.originalEvent);
      if (map.getZoom() === map.getMaxZoom()) cluster_event.propagatedFrom.spiderfy();
      else cluster_event.propagatedFrom.zoomToBounds({ animate: !reduce_motion() });
    });
    layer.addTo(map_state.layer);
    markers.clear();
    filtered_locations.forEach((location, index) => {
      const scenes = location.scenes.filter((scene) => film_id === 'all' || scene.film_id === film_id);
      const titles = scenes.map((scene) => film_catalog.find((film) => film.id === scene.film_id)!.title).join(' · ');
      const label = `${index + 1}. ${location.name} — ${titles}`;
      const marker = leaflet.marker(location.coordinates, {
        icon: leaflet.divIcon({ className: 'cinema-marker', html: `<span>${String(index + 1).padStart(2, '0')}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
        title: label, alt: label, keyboard: true,
      });
      const tooltip = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = location.name;
      const films = document.createElement('span');
      films.textContent = titles;
      tooltip.appendChild(title);
      tooltip.appendChild(films);
      marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -18], className: 'cinema-marker-label', opacity: 1 });
      marker.on('click', () => select_location(location.id));
      marker.on('keydown', (event: Leaflet.LeafletKeyboardEvent) => {
        if (event.originalEvent.key === 'Enter' || event.originalEvent.key === ' ') {
          leaflet.DomEvent.stop(event.originalEvent);
          select_location(location.id);
        }
      });
      marker.on('add', () => {
        const element = marker.getElement();
        element?.setAttribute('aria-label', label);
        element?.classList.toggle('is-selected', marker.options.zIndexOffset === 1000);
        element?.setAttribute('aria-pressed', String(marker.options.zIndexOffset === 1000));
        element?.addEventListener('focus', () => marker.openTooltip());
        element?.addEventListener('blur', () => { if (!element.classList.contains('is-selected')) marker.closeTooltip(); });
        if (marker.options.zIndexOffset === 1000) marker.openTooltip();
      });
      marker.addTo(layer);
      markers.set(location.id, marker);
    });
    if (filtered_locations.length) {
      const bounds = leaflet.latLngBounds(filtered_locations.map((location) => location.coordinates));
      const options = { padding: [42, 42] as Leaflet.PointTuple, maxZoom: 15, animate: false };
      if (initial_fit.current || reduce_motion()) map.fitBounds(bounds, options);
      else map.flyToBounds(bounds, { ...options, animate: true, duration: .6 });
      initial_fit.current = false;
    }
  }, [film_id, filtered_locations, map_state, select_location]);

  useEffect(() => {
    if (!map_state?.active) return;
    if (selected_id) map_state.map.stop();
    map_state.markers.forEach((marker, location_id) => {
      const selected = location_id === selected_id;
      marker.getElement()?.classList.toggle('is-selected', selected);
      marker.getElement()?.setAttribute('aria-pressed', String(selected));
      marker.setZIndexOffset(selected ? 1000 : 0);
      if (selected) {
        map_state.map.flyTo(marker.getLatLng(), Math.max(16, map_state.map.getZoom()), { animate: !reduce_motion(), duration: .5 });
        marker.openTooltip();
      } else marker.closeTooltip();
    });
    if (selected_id && reveal_selection.current) {
      const details = details_elements.current.get(selected_id);
      details?.focus({ preventScroll: true });
      details?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [selected_id, map_state, filtered_locations]);

  function choose_film(next_id: string) {
    set_selected_id(null);
    set_query('');
    set_film_id(next_id);
  }

  function fit_locations() {
    if (!map_state?.active || !filtered_locations.length) return;
    const bounds = map_state.leaflet.latLngBounds(filtered_locations.map((location) => location.coordinates));
    map_state.map.stop();
    map_state.map.flyToBounds(bounds, { padding: [42, 42], maxZoom: 15, animate: !reduce_motion(), duration: .5 });
  }

  function scroll_films(direction: number) {
    filmstrip_element.current?.scrollBy({ left: direction * 420, behavior: reduce_motion() ? 'instant' : 'smooth' });
  }

  return <>
    <section className="cinema-picker" aria-label="Choose a film">
      <div className="cinema-controls"><div className="cinema-collection-label"><Film size={18} aria-hidden="true" /><span>THE COLLECTION</span><small>{film_catalog.length} films · {film_locations.length} places</small></div>
        <label className="cinema-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search films, directors or places</span><input type="search" disabled={!interactive} value={query} placeholder="Film, director or place" onChange={(event) => { set_query(event.target.value); set_film_id('all'); set_selected_id(null); }} />{query && <button disabled={!interactive} aria-label="Clear search" onClick={() => set_query('')}><X size={17} /></button>}</label>
        <div className="cinema-strip-arrows"><button disabled={!interactive} aria-label="Previous films" onClick={() => scroll_films(-1)}><ChevronLeft size={19} /></button><button disabled={!interactive} aria-label="More films" onClick={() => scroll_films(1)}><ChevronRight size={19} /></button></div>
      </div>
      <div className="cinema-filmstrip" ref={filmstrip_element}>
        <button disabled={!interactive} className="cinema-all-films" aria-label="All films" aria-pressed={film_id === 'all'} onClick={() => choose_film('all')}><span className="cinema-all-art"><Film size={26} strokeWidth={1.2} /><span>NEW YORK<br /><em>on film.</em></span></span><span className="cinema-film-card-label">All films <small>{film_catalog.length}</small></span>{film_id === 'all' && <Check className="cinema-film-check" size={16} aria-hidden="true" />}</button>
        {strip_films.map((film) => {
          const scene = film_locations.flatMap((location) => location.scenes).find((scene) => scene.film_id === film.id && scene.still);
          return <button disabled={!interactive} className="cinema-film-card" key={film.id} aria-label={`${film.title} ${film.year}`} aria-pressed={film_id === film.id} onClick={() => choose_film(film.id)}><span className="cinema-film-card-image">{scene ? <SceneStill scene={scene} thumbnail /> : <span className="cinema-film-year">{film.year}</span>}</span><span className="cinema-film-card-label">{film.title}<small>{film.year}</small></span>{film_id === film.id && <Check className="cinema-film-check" size={16} aria-hidden="true" />}</button>;
        })}
      </div>
    </section>
    <div className="cinema-workspace">
      <section className="cinema-map-panel" aria-label="Filming location map">
        <div className="cinema-map-toolbar"><span><span className="cinema-map-eyebrow">ON LOCATION</span><strong>{selected_film?.title ?? (query ? 'Search results' : 'New York City')}</strong></span><button onClick={fit_locations} disabled={!map_state?.active || !filtered_locations.length}><Maximize2 size={16} aria-hidden="true" />Show all places</button></div>
        <div ref={map_element} className="cinema-map" aria-label="Interactive New York map. Use arrow keys to pan and plus or minus to zoom." />
        {map_status !== 'ready' && <output className="cinema-map-message">{map_status === 'loading' ? 'Loading New York…' : <><span>The street map couldn’t load. Every scene, source and Google Maps link is still available below.</span><button onClick={() => { set_map_status('loading'); set_map_state(null); set_retry_count((value) => value + 1); }}>Retry map</button></>}</output>}
        <div className="cinema-map-caption"><span aria-live="polite">{filtered_locations.length} {filtered_locations.length === 1 ? 'place' : 'places'} on the map</span><span>Select a pin to find its films</span></div>
      </section>
      <aside className="cinema-places" aria-label="Film locations"><div className="cinema-list-heading"><p className="cinema-kicker">{selected_film ? `${selected_film.year} / ${selected_film.director}` : 'SCENES IN THE CITY'}</p><h2>{selected_film?.title ?? (query ? `Results for “${query}”` : 'Find your scene.')}</h2><p>{selected_film?.note ?? 'Real places. Familiar frames.'}</p></div>
        {!filtered_locations.length && <div className="cinema-empty"><p>No places match this search.</p><button disabled={!interactive} onClick={() => choose_film('all')}>Explore all films</button></div>}
        <ol className="cinema-place-list">{filtered_locations.map((location, index) => {
          const scenes = location.scenes.filter((scene) => film_id === 'all' || scene.film_id === film_id);
          const preview_scene = scenes.find((scene) => scene.still) ?? scenes[0];
          const titles = scenes.map((scene) => film_catalog.find((film) => film.id === scene.film_id)!.title).join(' · ');
          const selected = selected_id === location.id;
          return <li key={location.id} className={selected ? 'is-selected' : ''}>
            <details className="cinema-location" open={selected}>
              <summary className="cinema-place-button" aria-label={`${String(index + 1).padStart(2, '0')} ${location.name} · ${titles}`} onClick={(event) => { event.preventDefault(); if (selected) set_selected_id(null); else select_location(location.id, false); }}>
                <span className="cinema-place-thumbnail"><SceneStill scene={preview_scene} thumbnail /><span>{String(index + 1).padStart(2, '0')}</span></span><span className="cinema-place-copy"><strong>{location.name}</strong><span>{titles}</span><small>{location.neighborhood} · {location.borough}</small></span><ChevronRight className="cinema-place-chevron" size={17} aria-hidden="true" />
              </summary>
              <section className="cinema-selected" aria-label={`Details for ${location.name}`} tabIndex={-1} ref={(element) => { if (element) details_elements.current.set(location.id, element); else details_elements.current.delete(location.id); }}>
                <div className="cinema-selected-title"><h3>{location.name}</h3><button aria-label="Close location details" onClick={() => { set_selected_id(null); details_elements.current.get(location.id)?.parentElement?.querySelector('summary')?.focus(); }}><X size={17} /></button></div><SceneDetails location={location} film_id={film_id} selected={selected} google_maps_key={google_maps_key} />
              </section>
            </details>
          </li>;
        })}</ol>
      </aside>
    </div>
  </>;
}
