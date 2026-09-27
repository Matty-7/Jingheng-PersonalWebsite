'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Film, Music2 } from 'lucide-react';
import type * as Leaflet from 'leaflet';
import type { AtlasIndexEntry } from '@/lib/atlas_browser';

export function AtlasMap({
  entries,
  selected_id,
  on_select,
}: {
  entries: AtlasIndexEntry[];
  selected_id: string | null;
  on_select: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const active_map = useRef<Leaflet.Map | null>(null);
  const select = useRef(on_select);
  const selected = useRef(selected_id);
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
  }, [on_select, selected_id]);

  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | undefined;
    let observer: ResizeObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    void import('leaflet')
      .then(async (module) => {
        const leaflet = module.default ?? module;
        const [, { maplibreGL }] = await Promise.all([
          import('leaflet.markercluster'),
          import('@maplibre/maplibre-gl-leaflet'),
        ]);
        if (disposed || !container.current) return;
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
      })
      .catch(() => {
        if (!disposed) set_status('error');
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
      marker.on('click', choose);
      marker.on('keydown', (event: Leaflet.LeafletKeyboardEvent) => {
        if (![' ', 'Enter'].includes(event.originalEvent.key)) return;
        leaflet.DomEvent.stop(event.originalEvent);
        choose();
      });
      marker.on('add', () => {
        const element = marker.getElement();
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
      cluster.addLayer(marker);
      for (const work of works) markers.current.set(work.id, marker);
      next_icons.push({ key, host, medium: entry.medium });
    }
    const render_icons = requestAnimationFrame(() => set_icons(next_icons));
    if (entries.length > 60)
      map.setView([40.744, -73.98], 12, { animate: false });
    else if (entries.length)
      map.fitBounds(
        entries.map((entry) => entry.coordinates),
        {
          paddingTopLeft: [30, 30],
          paddingBottomRight: [30, 80],
          maxZoom: 14,
          animate: false,
        },
      );
    return () => cancelAnimationFrame(render_icons);
  }, [instance, entries]);

  useEffect(() => {
    if (!instance || active_map.current !== instance.map) return;
    const active = selected_id ? markers.current.get(selected_id) : undefined;
    for (const marker of new Set(markers.current.values())) {
      marker.setZIndexOffset(marker === active ? 1000 : 0);
      marker.getElement()?.classList.toggle('is-selected', marker === active);
    }
    if (!active) return;
    const point = instance.leaflet
      .circleMarker(active.getLatLng(), {
        radius: 9,
        color: '#ffffff',
        weight: 3,
        fillColor: '#153f2c',
        fillOpacity: 1,
        interactive: false,
      })
      .addTo(instance.map);
    const card_height =
      document.querySelector('.atlas-card')?.getBoundingClientRect().height ??
      220;
    instance.map.panInside(active.getLatLng(), {
      paddingTopLeft: [36, 36],
      paddingBottomRight: [
        36,
        Math.min(card_height + 44, instance.map.getSize().y / 2),
      ],
      animate: false,
    });
    return () => {
      point.remove();
    };
  }, [instance, entries, selected_id]);

  return (
    <>
      <div
        ref={container}
        className="atlas-map"
        id="atlas-map"
        role="application"
        aria-label="New York cultural map"
      />
      {icons.map(({ key, host, medium }) =>
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
      )}
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
}
