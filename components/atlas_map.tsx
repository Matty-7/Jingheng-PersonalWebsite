'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Film, Music2 } from 'lucide-react';
import leaflet from 'leaflet';
import type * as Leaflet from 'leaflet';
import 'leaflet.markercluster';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import maplibre_worker_url from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type { AtlasIndexEntry } from '@/lib/atlas_browser';

export const AtlasMap = memo(function AtlasMap({
  entries,
  selected_id,
  on_select,
  on_prefetch,
}: {
  entries: AtlasIndexEntry[];
  selected_id: string | null;
  on_select: (id: string) => void;
  on_prefetch: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const active_map = useRef<Leaflet.Map | null>(null);
  const framed_map = useRef<Leaflet.Map | null>(null);
  const select = useRef(on_select);
  const selected = useRef(selected_id);
  const prefetch = useRef(on_prefetch);
  const [retry, set_retry] = useState(0);
  const [status, set_status] = useState('loading');
  const [instance, set_instance] = useState<{
    leaflet: typeof Leaflet;
    map: Leaflet.Map;
    cluster: Leaflet.MarkerClusterGroup;
  } | null>(null);
  const markers = useRef(new Map<string, Leaflet.Marker>());
  const [icons, set_icons] = useState<
    { key: string; host: HTMLElement; medium: AtlasIndexEntry['medium'] }[]
  >([]);
  useEffect(() => {
    select.current = on_select;
    selected.current = selected_id;
    prefetch.current = on_prefetch;
  }, [on_select, selected_id, on_prefetch]);

  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | undefined;
    let observer: ResizeObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    void Promise.resolve().then(() => {
      try {
        if (disposed || !container.current) return;
        setWorkerUrl(maplibre_worker_url);
        map = leaflet
          .map(container.current, {
            zoomControl: false,
            scrollWheelZoom: true,
            zoomAnimation: false,
            fadeAnimation: false,
            markerZoomAnimation: false,
            minZoom: 9,
            maxZoom: 19,
          })
          .setView([40.754, -73.973], 12);
        active_map.current = map;
        leaflet.control.zoom({ position: 'topright' }).addTo(map);
        const cluster = leaflet.markerClusterGroup({
          showCoverageOnHover: false,
          animate: false,
          maxClusterRadius: 35,
          spiderfyOnMaxZoom: true,
          iconCreateFunction(group) {
            const count = group.getChildCount();
            const host = document.createElement('span');
            host.textContent = String(count);
            group.options.title = `${count} places. Zoom to explore.`;
            const icon = leaflet.divIcon({
              className: 'atlas-cluster',
              html: host,
              iconSize: [38, 38],
            });
            const create_icon = icon.createIcon.bind(icon);
            icon.createIcon = (old_icon) => {
              const element = create_icon(old_icon);
              element.setAttribute('role', 'button');
              element.setAttribute('aria-label', group.options.title!);
              return element;
            };
            return icon;
          },
        });
        cluster.on('clusterkeydown', (event) => {
          const key_event = event as Leaflet.LeafletKeyboardEvent & {
            propagatedFrom: Leaflet.MarkerCluster;
          };
          if (key_event.originalEvent.key !== ' ') return;
          leaflet.DomEvent.stop(key_event.originalEvent);
          if (map!.getZoom() === map!.getMaxZoom())
            key_event.propagatedFrom.spiderfy();
          else key_event.propagatedFrom.zoomToBounds({ animate: false });
          map!.getContainer().focus({ preventScroll: true });
        });
        cluster.addTo(map);
        observer = new ResizeObserver(() =>
          map?.invalidateSize({ pan: false }),
        );
        observer.observe(container.current);
        set_instance({ leaflet, map, cluster });
        // The vector basemap shares Leaflet's camera and existing accessible pins.
        const basemap = maplibreGL({
          style: 'https://tiles.openfreemap.org/styles/positron',
          interactive: false,
          attributionControl: {
            customAttribution:
              '<a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/">© OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a>',
          },
        });
        try {
          basemap.addTo(map);
          const vector_map = basemap.getMaplibreMap();
          let loaded = false;
          let initial_error = false;
          const ready = () => {
            if (disposed || initial_error) return;
            loaded = true;
            clearTimeout(timeout);
            set_status('ready');
          };
          timeout = setTimeout(() => {
            if (!disposed && !loaded) set_status('error');
          }, 12000);
          vector_map.on('load', ready);
          vector_map.on('error', () => {
            // A later isolated tile error should not obscure a usable map.
            if (!disposed && !loaded) {
              initial_error = true;
              clearTimeout(timeout);
              set_status('error');
            }
          });
          vector_map.on('webglcontextlost', () => {
            if (!disposed) set_status('error');
          });
          vector_map.on('webglcontextrestored', () => {
            if (!disposed) {
              set_status('loading');
              void vector_map.once('idle', ready);
            }
          });
        } catch (error) {
          console.warn('Atlas basemap could not initialize.', error);
          // The bridge needs a safe removal path if GPU initialization throws
          // before it has a MapLibre instance. Keep search and Leaflet pins usable.
          if (!basemap.getMaplibreMap()) {
            basemap.onRemove = () => {
              basemap.getContainer()?.remove();
              return basemap;
            };
          }
          basemap.remove();
          if (!disposed) set_status('error');
        }
      } catch {
        if (!disposed) set_status('error');
      }
    });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      observer?.disconnect();
      if (active_map.current === map) active_map.current = null;
      map?.remove();
    };
  }, [retry]);

  useEffect(() => {
    if (!instance || active_map.current !== instance.map) return;
    const { leaflet, map, cluster } = instance;
    cluster.clearLayers();
    markers.current.clear();
    const places = new Map<string, AtlasIndexEntry[]>();
    for (const entry of entries) {
      const group = places.get(entry.place_key) ?? [];
      group.push(entry);
      places.set(entry.place_key, group);
    }
    const next_icons: typeof icons = [];
    const next_markers: Leaflet.Marker[] = [];
    for (const [key, works] of places) {
      const entry = works[0];
      const host = document.createElement('span');
      const title = `${entry.place_name}: ${works.map((work) => work.title).join('; ')}`;
      const marker = leaflet.marker(entry.coordinates, {
        title,
        alt: title,
        keyboard: true,
        icon: leaflet.divIcon({
          className: `atlas-pin atlas-pin-${entry.medium}`,
          html: host,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
      });
      const choose = () =>
        select.current(
          works.find((work) => work.id === selected.current)?.id ?? entry.id,
        );
      const anticipate = () =>
        prefetch.current(
          works.find((work) => work.id === selected.current)?.id ?? entry.id,
        );
      marker.on('mouseover', anticipate);
      marker.on('click', choose);
      marker.on('keydown', (event: Leaflet.LeafletKeyboardEvent) => {
        if (![' ', 'Enter'].includes(event.originalEvent.key)) return;
        leaflet.DomEvent.stop(event.originalEvent);
        choose();
      });
      marker.on('add', () => {
        const element = marker.getElement();
        element?.addEventListener('focus', () => {
          anticipate();
          // Leaflet may rebuild a focused pin when a flight's zoom snaps.
          const live = marker.getElement();
          if (live?.isConnected && live !== element && !element?.isConnected)
            live.focus({ preventScroll: true });
        });
        element?.addEventListener('touchstart', anticipate, { passive: true });
        element?.setAttribute('role', 'button');
        element?.setAttribute('aria-label', title);
        element?.classList.toggle(
          'is-selected',
          works.some((work) => work.id === selected.current),
        );
      });
      marker.bindTooltip(entry.place_name, {
        direction: 'top',
        offset: [0, -16],
      });
      next_markers.push(marker);
      for (const work of works) markers.current.set(work.id, marker);
      next_icons.push({ key, host, medium: entry.medium });
    }
    cluster.addLayers(next_markers);
    const render_icons = requestAnimationFrame(() => set_icons(next_icons));
    const animate =
      framed_map.current === map &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    framed_map.current = map;
    map.stop();
    if (selected.current && markers.current.has(selected.current)) {
      return () => cancelAnimationFrame(render_icons);
    }
    if (entries.length > 60)
      map.flyTo([40.744, -73.98], 12, { animate, duration: 0.65 });
    else if (entries.length)
      map.flyToBounds(
        entries.map((entry) => entry.coordinates),
        {
          paddingTopLeft: [30, 30],
          paddingBottomRight: [30, 80],
          maxZoom: 14,
          animate,
          duration: 0.65,
        },
      );
    return () => cancelAnimationFrame(render_icons);
  }, [instance, entries]);

  useEffect(() => {
    if (!instance || active_map.current !== instance.map) return;
    const active = selected_id ? markers.current.get(selected_id) : undefined;
    if (!active) {
      return;
    }
    active.setZIndexOffset(1000);
    active.getElement()?.classList.add('is-selected');
    const point = instance.leaflet
      .circleMarker(active.getLatLng(), {
        radius: 9,
        color: '#ffffff',
        weight: 3,
        fillColor: '#153f2c',
        fillOpacity: 1,
        interactive: false,
        className: 'atlas-selected-point',
      })
      .addTo(instance.map);
    const { map } = instance;
    const card = map
      .getContainer()
      .parentElement?.querySelector<HTMLElement>('.atlas-card');
    const reduced_motion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    let following = true;
    let frame = 0;
    const center_place = () => {
      if (!following || active_map.current !== map) return;
      map.stop();
      const zoom = Math.max(map.getZoom(), 14);
      const height = map.getSize().y;
      const visible_height = Math.max(
        80,
        Math.min(height, card?.offsetTop ?? height),
      );
      const center = map.unproject(
        map
          .project(active.getLatLng(), zoom)
          .add([0, (height - visible_height) / 2]),
        zoom,
      );
      if (
        map.getZoom() === zoom &&
        map
          .project(map.getCenter(), zoom)
          .distanceTo(map.project(center, zoom)) < 1
      )
        return;
      map.flyTo(center, zoom, {
        animate: !reduced_motion.matches,
        duration: 0.65,
      });
    };
    const schedule_center = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(center_place);
    };
    const stop_following = () => {
      following = false;
      cancelAnimationFrame(frame);
      map.stop();
    };
    const motion_changed = () => {
      map.stop();
      if (reduced_motion.matches) center_place();
    };
    const observer = new ResizeObserver(schedule_center);
    if (card) observer.observe(card);
    schedule_center();
    map.getContainer().addEventListener('pointerdown', stop_following);
    map
      .getContainer()
      .addEventListener('wheel', stop_following, { passive: true });
    reduced_motion.addEventListener('change', motion_changed);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      map.getContainer().removeEventListener('pointerdown', stop_following);
      map.getContainer().removeEventListener('wheel', stop_following);
      reduced_motion.removeEventListener('change', motion_changed);
      if (active_map.current === map) map.stop();
      point.remove();
      active.setZIndexOffset(0);
      active.getElement()?.classList.remove('is-selected');
    };
  }, [instance, entries, selected_id]);

  const pin_icons = useMemo(
    () =>
      icons.map(({ key, host, medium }) =>
        createPortal(
          medium === 'film' ? (
            <Film size={17} aria-hidden="true" />
          ) : medium === 'music' ? (
            <Music2 size={17} aria-hidden="true" />
          ) : (
            <BookOpen size={17} aria-hidden="true" />
          ),
          host,
          key,
        ),
      ),
    [icons],
  );

  return (
    <>
      <div
        ref={container}
        className="atlas-map"
        id="atlas-map"
        role="application"
        aria-label="New York cultural map"
      />
      {pin_icons}
      {status !== 'ready' && (
        <output className="atlas-map-status">
          {status === 'loading' ? (
            'Loading map…'
          ) : (
            <>
              Map unavailable. Search still works.
              <button
                type="button"
                onClick={() => {
                  set_status('loading');
                  set_instance(null);
                  set_retry((value) => value + 1);
                }}
              >
                Retry map
              </button>
            </>
          )}
        </output>
      )}
    </>
  );
});
