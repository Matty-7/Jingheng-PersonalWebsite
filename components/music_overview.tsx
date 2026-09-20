'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { music_places, music_tracks, type MusicTrack } from '@/lib/nyc_music_map';

type OverviewState = { map: Leaflet.Map; markers: Map<string, Leaflet.Marker> };

export function MusicOverview({ selected_place_id, fit_request, on_select }: { selected_place_id: string; fit_request: number; on_select: (track: MusicTrack, place_id: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const selection = useRef(on_select);
  const selected_id = useRef(selected_place_id);
  const [instance, set_instance] = useState<OverviewState | null>(null);
  const [status, set_status] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, set_retry] = useState(0);
  useEffect(() => { selection.current = on_select; selected_id.current = selected_place_id; }, [on_select, selected_place_id]);

  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | undefined;
    let observer: ResizeObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    import('leaflet').then(async (module) => {
      const leaflet = module.default ?? module;
      await import('leaflet.markercluster');
      if (disposed || !container.current) return;
      const reduce_motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      map = leaflet.map(container.current, { scrollWheelZoom: false, zoomControl: false, zoomAnimation: false, fadeAnimation: !reduce_motion, markerZoomAnimation: !reduce_motion, maxZoom: 19 });
      leaflet.control.zoom({ position: 'bottomright' }).addTo(map);
      let loaded_tiles = 0;
      const tiles = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
      tiles.on('loading', () => { loaded_tiles = 0; clearTimeout(timeout); timeout = setTimeout(() => { if (!disposed && !loaded_tiles) set_status('error'); }, 12000); });
      tiles.on('tileload', () => { loaded_tiles++; if (!disposed) set_status('ready'); });
      tiles.on('load', () => { clearTimeout(timeout); if (!disposed) set_status(loaded_tiles ? 'ready' : 'error'); });
      tiles.addTo(map);
      const cluster = leaflet.markerClusterGroup({ showCoverageOnHover: false, animate: !reduce_motion, maxClusterRadius: 32, spiderfyOnMaxZoom: true, iconCreateFunction: (group) => {
        const count = group.getChildCount();
        group.options.title = `${count} music places. Zoom to expand.`;
        const icon = leaflet.divIcon({ className: 'sound-cluster', html: `<span aria-hidden="true">${count}<small>places</small></span>`, iconSize: [46, 46] });
        const create_icon = icon.createIcon.bind(icon);
        icon.createIcon = (old_icon) => {
          const element = create_icon(old_icon);
          element.setAttribute('aria-label', group.options.title!);
          element.setAttribute('role', 'button');
          return element;
        };
        return icon;
      } });
      cluster.on('clusterkeydown', (event) => {
        const keyboard_event = event as Leaflet.LeafletKeyboardEvent & { propagatedFrom: Leaflet.MarkerCluster };
        if (keyboard_event.originalEvent.key !== ' ') return;
        leaflet.DomEvent.stop(keyboard_event.originalEvent);
        if (map!.getZoom() === map!.getMaxZoom()) keyboard_event.propagatedFrom.spiderfy();
        else keyboard_event.propagatedFrom.zoomToBounds({ animate: !reduce_motion });
        map!.getContainer().focus({ preventScroll: true });
      });
      const markers = new Map<string, Leaflet.Marker>();
      for (const place of music_places) {
        const tracks = music_tracks.filter((track) => track.place_ids.includes(place.id));
        const title = `${place.name}: ${tracks.map((track) => `${track.title} by ${track.artist}`).join('; ')}`;
        const marker = leaflet.marker(place.coordinates as [number, number], { title, alt: title, keyboard: true, icon: leaflet.divIcon({ className: 'sound-marker', html: `<span aria-hidden="true">♪<small>${tracks.length}</small></span>`, iconSize: [40, 40], iconAnchor: [20, 20] }) });
        const content = document.createElement('div');
        content.className = 'sound-map-popup';
        const heading = document.createElement('strong');
        heading.textContent = place.name;
        content.appendChild(heading);
        const scope = document.createElement('p');
        scope.textContent = `${place.precision} · ${place.area}`;
        content.appendChild(scope);
        for (const track of tracks) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = `${track.title} · ${track.artist}`;
          button.setAttribute('aria-label', `Choose ${track.title} by ${track.artist} at ${place.name}`);
          button.addEventListener('click', () => selection.current(track, place.id));
          content.appendChild(button);
        }
        marker.bindPopup(content, { maxWidth: 300, maxHeight: 260, className: 'sound-popup' });
        marker.bindTooltip(title, { direction: 'top', className: 'sound-marker-label' });
        marker.on('popupopen', () => content.querySelector('button')?.focus({ preventScroll: true }));
        marker.on('keydown', (event: Leaflet.LeafletKeyboardEvent) => { if (event.originalEvent.key === ' ') { leaflet.DomEvent.stop(event.originalEvent); marker.openPopup(); } });
        content.addEventListener('keydown', (event) => { if (event.key === 'Escape') { marker.closePopup(); marker.getElement()?.focus({ preventScroll: true }); } });
        marker.on('add', () => { const element = marker.getElement(); element?.setAttribute('role', 'button'); element?.setAttribute('aria-label', title); element?.classList.toggle('is-selected', place.id === selected_id.current); });
        cluster.addLayer(marker);
        markers.set(place.id, marker);
      }
      map.addLayer(cluster);
      map.fitBounds(music_places.map((place) => place.coordinates as [number, number]), { padding: [32, 32], maxZoom: 13, animate: false });
      observer = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
      observer.observe(container.current);
      set_instance({ map, markers });
    }).catch(() => { if (!disposed) set_status('error'); });
    return () => { disposed = true; clearTimeout(timeout); observer?.disconnect(); map?.remove(); };
  }, [retry]);

  useEffect(() => {
    if (!instance || !container.current?.classList.contains('leaflet-container')) return;
    instance.map.closePopup();
    instance.map.fitBounds(music_places.map((place) => place.coordinates as [number, number]), { padding: [32, 32], maxZoom: 13, animate: false });
  }, [instance, fit_request]);

  useEffect(() => {
    instance?.markers.forEach((marker, id) => {
      marker.setZIndexOffset(id === selected_place_id ? 1000 : 0);
      marker.getElement()?.classList.toggle('is-selected', id === selected_place_id);
    });
  }, [instance, selected_place_id]);

  return <div className="sound-overview-wrap">
    <div ref={container} className="sound-overview" aria-label="All song locations" />
    {status !== 'ready' && <output className="sound-map-status">{status === 'loading' ? 'Loading map…' : <>Map tiles unavailable. Songs and Google Maps links still work. <button onClick={() => { set_status('loading'); set_instance(null); set_retry((value) => value + 1); }}>Retry map</button></>}</output>}
  </div>;
}
