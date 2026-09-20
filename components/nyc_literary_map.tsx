'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, Check, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { entries_for_work, literary_embed_url, literary_entries, literary_maps_url, literary_works, type LiteraryWork } from '@/lib/nyc_literary_map';

function LiteraryCover({ work, small = false }: { work: LiteraryWork; small?: boolean }) {
  const [failed, set_failed] = useState(false);
  if (!work.cover || failed) return <span className="literary-cover-fallback"><BookOpen aria-hidden="true" /><span>{work.title}</span></span>;
  return <Image unoptimized src={work.cover.src} alt={small ? '' : work.cover.alt} width={240} height={360} loading={small ? 'eager' : 'lazy'} onError={() => set_failed(true)} />;
}

export function NycLiteraryMap({ google_maps_key }: { google_maps_key: string }) {
  const [work_id, set_work_id] = useState('all');
  const [selected_id, set_selected_id] = useState(literary_entries[0].id);
  const [map_visible, set_map_visible] = useState(true);
  const [map_reload, set_map_reload] = useState(0);
  const reading_panel = useRef<HTMLElement>(null);
  const map_panel = useRef<HTMLElement>(null);
  const visible_entries = entries_for_work(work_id);
  const selected_entry = visible_entries.find((entry) => entry.id === selected_id) ?? visible_entries[0];
  const embed_url = literary_embed_url(selected_entry, google_maps_key);
  const selected_work = literary_works.find((work) => work.id === selected_entry.work_id)!;
  const selected_index = visible_entries.indexOf(selected_entry);

  function choose_work(next_id: string) {
    set_work_id(next_id);
    set_selected_id(entries_for_work(next_id)[0].id);
  }

  function show_passage(entry_id: string) {
    set_selected_id(entry_id);
    reading_panel.current?.focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 759px)').matches) reading_panel.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  return <>
    <section className="literary-collection" aria-label="Choose a work">
      <div className="literary-collection-label"><span>THE READING LIST</span><span>{literary_works.length} works · {literary_entries.length} places</span></div>
      <div className="literary-work-buttons">
        <button className="literary-all" aria-pressed={work_id === 'all'} onClick={() => choose_work('all')}><BookOpen size={24} aria-hidden="true" /><strong>All works</strong><span>Books &amp; magazines</span>{work_id === 'all' && <Check size={16} aria-hidden="true" />}</button>
        {literary_works.map((work) => <button key={work.id} aria-pressed={work_id === work.id} onClick={() => choose_work(work.id)}>
          <span className="literary-picker-cover"><LiteraryCover work={work} small /></span>
          <span className="literary-picker-copy"><strong>{work.title}</strong><span>{work.author}</span><small>{work.year} · {work.kind}</small></span>
          {work_id === work.id && <Check className="literary-work-check" size={16} aria-hidden="true" />}
        </button>)}
      </div>
    </section>
    <div className="literary-workspace">
      <section className="literary-map-panel" ref={map_panel} aria-label="Google map of the selected place" tabIndex={-1}>
        <div className="literary-map-heading"><MapPin size={18} aria-hidden="true" /><div><span>SELECTED PLACE</span><strong aria-live="polite">{selected_entry.place}</strong></div><a href={literary_maps_url(selected_entry)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${selected_entry.place} in Google Maps`}><ArrowUpRight size={22} aria-hidden="true" /></a></div>
        {map_visible && embed_url ? <iframe key={`${selected_entry.id}-${map_reload}`} className="literary-google-map" title={`Google Maps: ${selected_entry.place}`} src={embed_url} referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="literary-map-hidden"><MapPin size={26} aria-hidden="true" /><p>{selected_entry.place}</p><span>{selected_entry.area}</span>{embed_url ? <button onClick={() => set_map_visible(true)}>Show Google map</button> : <p>The map is unavailable. Use the Google Maps link below.</p>}</div>}
        <div className="literary-map-help"><a href={literary_maps_url(selected_entry)} target="_blank" rel="noopener noreferrer">Open in Google Maps <ArrowUpRight size={14} aria-hidden="true" /></a>{embed_url && <button onClick={() => set_map_visible(!map_visible)}>{map_visible ? 'Hide map' : 'Show map'}</button>}{map_visible && embed_url && <button onClick={() => set_map_reload((value) => value + 1)}>Reload map</button>}</div>
        <p className="literary-map-note">Showing one selected place. If the map is unavailable, use the Google Maps link.</p>
        <nav className="literary-place-index" aria-label="Literary places">
          <p className="literary-index-label">{visible_entries.length} PLACES IN THIS SELECTION</p>
          <ol>{visible_entries.map((entry, index) => <li key={entry.id}><button aria-pressed={entry.id === selected_entry.id} onClick={() => show_passage(entry.id)}><span>{String(index + 1).padStart(2, '0')}</span><span><strong>{entry.place}</strong><small>{literary_works.find((work) => work.id === entry.work_id)!.author}</small></span>{entry.id === selected_entry.id ? <BookOpen size={18} aria-hidden="true" /> : <span aria-hidden="true">↗</span>}</button></li>)}</ol>
        </nav>
      </section>
      <article className="literary-reader" ref={reading_panel} tabIndex={-1} aria-label={`Reading: ${selected_entry.place}`}>
        <div className="literary-reader-top"><span>PASSAGE {String(selected_index + 1).padStart(2, '0')} / {String(visible_entries.length).padStart(2, '0')}</span><div><button aria-label="Previous passage" disabled={selected_index === 0} onClick={() => show_passage(visible_entries[selected_index - 1].id)}><ChevronLeft size={19} /></button><button aria-label="Next passage" disabled={selected_index === visible_entries.length - 1} onClick={() => show_passage(visible_entries[selected_index + 1].id)}><ChevronRight size={19} /></button></div></div>
        <div key={selected_entry.id} className="literary-reading-content">
          <p className="literary-area">{selected_entry.area}</p>
          <h2>{selected_entry.place}</h2>
          <div className="literary-work-credit"><figure><LiteraryCover key={selected_work.id} work={selected_work} /></figure><div><span>{selected_work.kind} · {selected_work.year}</span><h3>{selected_work.title}</h3><p>{selected_work.author}</p></div></div>
          <p className="literary-excerpt-label">IN THE ORIGINAL WORDS <span>{selected_entry.excerpt_kind}</span></p>
          <blockquote cite={selected_entry.source_url}>{selected_entry.excerpt}</blockquote>
          <p className="literary-citation">{selected_entry.locator}</p>
          <a className="literary-source" href={selected_entry.source_url} target="_blank" rel="noopener noreferrer">Read the source <ArrowUpRight size={15} aria-hidden="true" /></a>
          <div className="literary-context"><h3>Reading the place</h3><p>{selected_entry.note}</p></div>
          <div className="literary-location-note"><MapPin size={17} aria-hidden="true" /><div><p>{selected_entry.precision}</p><p>{selected_entry.visit_note}</p></div></div>
          <div className="literary-reader-actions"><a href={literary_maps_url(selected_entry)} target="_blank" rel="noopener noreferrer">Open in Google Maps <ArrowUpRight size={17} aria-hidden="true" /></a><button onClick={() => { map_panel.current?.focus({ preventScroll: true }); map_panel.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}>View map</button></div>
          <details className="literary-provenance"><summary>Text &amp; cover notes</summary><p>{selected_work.rights}. {selected_entry.excerpt_kind} transcribed from the linked source; original wording is retained.</p>{selected_work.cover && <p>{selected_work.cover.edition}. {selected_work.cover.credit}. <a href={selected_work.cover.source_url} target="_blank" rel="noopener noreferrer">Cover source ↗</a></p>}{selected_entry.place_source_url && <p><a href={selected_entry.place_source_url} target="_blank" rel="noopener noreferrer">Historical location reference ↗</a></p>}</details>
        </div>
      </article>
    </div>
  </>;
}
