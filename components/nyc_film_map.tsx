'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Film, MapPin, Maximize2, Navigation, X } from 'lucide-react';
import type * as Leaflet from 'leaflet';
import { directions_url, film_catalog, film_locations, film_sources, locations_for_film, type FilmLocation } from '@/lib/nyc_film_map';

type MapState = { active: boolean; leaflet: typeof Leaflet; map: Leaflet.Map; layer: Leaflet.LayerGroup; markers: Map<string, Leaflet.Marker> };

function LocationDetails({ location, film_id }: { location: FilmLocation; film_id: string }) {
  const scenes = location.scenes.filter((scene) => film_id === 'all' || scene.film_id === film_id);
  return (
    <div className="cinema-details">
      <p className="cinema-address"><MapPin size={16} aria-hidden="true" />{location.address}</p>
      {scenes.map((scene) => (
        <div className="cinema-scene" key={scene.film_id}>
          <p className="cinema-film-label">{film_catalog.find((film) => film.id === scene.film_id)?.title}</p>
          <p>{scene.scene}</p>
          <div className="cinema-sources">{scene.source_ids.map((source_id) => {
            const source = film_sources.find((item) => item.id === source_id)!;
            return <a key={source_id} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} <ArrowUpRight size={13} aria-hidden="true" /></a>;
          })}</div>
        </div>
      ))}
      <p className="cinema-visit"><strong>{location.access}</strong> · {location.visit_note}</p>
      <a className="cinema-directions" href={directions_url(location)} target="_blank" rel="noopener noreferrer"><Navigation size={16} aria-hidden="true" />Walking directions <ArrowUpRight size={16} aria-hidden="true" /></a>
    </div>
  );
}

export function NycFilmMap() {
  const [film_id, set_film_id] = useState('youve-got-mail');
  const [selected_id, set_selected_id] = useState<string | null>(null);
  const [map_state, set_map_state] = useState<MapState | null>(null);
  const [map_status, set_map_status] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry_count, set_retry_count] = useState(0);
  const map_element = useRef<HTMLDivElement>(null);
  const details_element = useRef<HTMLElement>(null);
  const filtered_locations = locations_for_film(film_id);
  const selected_location = filtered_locations.find((location) => location.id === selected_id);
  const selected_film = film_catalog.find((film) => film.id === film_id);

  const select_location = useCallback((location_id: string) => {
    set_selected_id(location_id);
  }, []);

  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | undefined;
    let instance: MapState | undefined;
    let resize_observer: ResizeObserver | undefined;
    let load_timeout: ReturnType<typeof setTimeout> | undefined;
    import('leaflet').then((leaflet) => {
      if (disposed || !map_element.current) return;
      const reduce_motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      map = leaflet.map(map_element.current, {
        center: [40.781, -73.977], zoom: 14, minZoom: 10, maxZoom: 19,
        scrollWheelZoom: false, zoomControl: false, zoomAnimation: !reduce_motion,
        fadeAnimation: !reduce_motion, markerZoomAnimation: !reduce_motion,
      });
      leaflet.control.zoom({ position: 'bottomright' }).addTo(map);
      const tiles = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      let loaded_tiles = 0;
      tiles.on('loading', () => {
        loaded_tiles = 0;
        clearTimeout(load_timeout);
        load_timeout = setTimeout(() => { if (!disposed && !loaded_tiles) set_map_status('error'); }, 12000);
      });
      tiles.on('tileload', () => {
        loaded_tiles += 1;
        if (!disposed) set_map_status('ready');
      });
      tiles.on('load', () => {
        clearTimeout(load_timeout);
        if (!disposed) set_map_status(loaded_tiles ? 'ready' : 'error');
      });
      tiles.addTo(map);
      const layer = leaflet.layerGroup().addTo(map);
      instance = { active: true, leaflet, map, layer, markers: new Map() };
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
    const { leaflet, map, layer, markers } = map_state;
    const visible_locations = locations_for_film(film_id);
    layer.clearLayers();
    markers.clear();
    visible_locations.forEach((location, index) => {
      const marker = leaflet.marker(location.coordinates, {
        icon: leaflet.divIcon({ className: 'cinema-marker', html: `<span>${index + 1}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
        title: `${index + 1}. ${location.name}`, alt: location.name, keyboard: true,
      });
      marker.on('click', () => select_location(location.id));
      marker.addTo(layer);
      marker.getElement()?.setAttribute('aria-label', `${index + 1}. ${location.name}`);
      markers.set(location.id, marker);
    });
    map.fitBounds(leaflet.latLngBounds(visible_locations.map((location) => location.coordinates)), { padding: [40, 40], maxZoom: 15, animate: false });
  }, [film_id, map_state, select_location]);

  useEffect(() => {
    if (!map_state?.active) return;
    map_state.markers.forEach((marker, location_id) => {
      const selected = location_id === selected_id;
      marker.getElement()?.classList.toggle('is-selected', selected);
      marker.getElement()?.setAttribute('aria-pressed', String(selected));
      marker.setZIndexOffset(selected ? 1000 : 0);
      if (selected) map_state.map.panTo(marker.getLatLng(), { animate: false });
    });
    if (selected_id) {
      details_element.current?.focus({ preventScroll: true });
      details_element.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [selected_id, map_state, film_id]);

  function choose_film(next_id: string) {
    set_selected_id(null);
    set_film_id(next_id);
  }

  function fit_locations() {
    if (!map_state?.active) return;
    map_state.map.fitBounds(map_state.leaflet.latLngBounds(filtered_locations.map((location) => location.coordinates)), { padding: [40, 40], maxZoom: 15, animate: false });
  }

  return (
    <>
      <section className="cinema-picker" aria-label="Choose a film">
        <div className="cinema-picker-label"><Film size={18} aria-hidden="true" /><span>CHOOSE A FILM</span><span>{film_catalog.length} films / {film_locations.length} places</span></div>
        <div className="cinema-film-buttons">
          {film_catalog.map((film) => <button key={film.id} aria-pressed={film_id === film.id} onClick={() => choose_film(film.id)}>{film_id === film.id && <Check size={15} aria-hidden="true" />}<span>{film.title}</span><small>{film.year}</small></button>)}
          <button aria-pressed={film_id === 'all'} onClick={() => choose_film('all')}>{film_id === 'all' && <Check size={15} aria-hidden="true" />}All films</button>
        </div>
      </section>
      <div className="cinema-workspace">
        <section className="cinema-map-panel" aria-label="Filming location map">
          <div className="cinema-map-toolbar"><span aria-live="polite">{filtered_locations.length} places on the map</span><button onClick={fit_locations} disabled={!map_state}><Maximize2 size={15} aria-hidden="true" />Show all places</button></div>
          <div ref={map_element} className="cinema-map" aria-label="Interactive New York map. Use arrow keys to pan and plus or minus to zoom." />
          {map_status !== 'ready' && <output className="cinema-map-message">{map_status === 'loading' ? 'Loading the street map…' : <><span>The street map couldn’t load. All places and directions are available in the list.</span><button onClick={() => { set_map_status('loading'); set_map_state(null); set_retry_count((value) => value + 1); }}>Retry map</button></>}</output>}
          <div className="cinema-map-caption"><span>NEW YORK CITY</span><span>Select a numbered pin or a place in the list.</span></div>
        </section>
        <aside className="cinema-places" aria-label="Film locations">
          <div className="cinema-list-heading"><p className="cinema-kicker">{selected_film ? `${selected_film.year} / ${selected_film.director}` : 'THE COLLECTION'}</p><h2>{selected_film?.title ?? 'New York, on film.'}</h2><p>{selected_film?.note ?? 'Explore every sourced location in the collection.'}</p></div>
          {selected_location && <section className="cinema-selected" aria-label={`Details for ${selected_location.name}`} tabIndex={-1} ref={details_element}>
            <div className="cinema-selected-title"><h3>{selected_location.name}</h3><button aria-label="Close location details" onClick={() => set_selected_id(null)}><X size={18} /></button></div>
            <LocationDetails location={selected_location} film_id={film_id} />
          </section>}
          <ol className="cinema-place-list">
            {filtered_locations.map((location, index) => <li key={location.id}>
              <button className="cinema-place-button" aria-pressed={selected_id === location.id} onClick={() => select_location(location.id)}>
                <span className="cinema-place-number">{String(index + 1).padStart(2, '0')}</span>
                <span><strong>{location.name}</strong><span>{location.neighborhood} · {location.borough}</span></span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
              <details className="cinema-list-details"><summary>Scene &amp; visiting details</summary><LocationDetails location={location} film_id={film_id} /></details>
            </li>)}
          </ol>
        </aside>
      </div>
    </>
  );
}
