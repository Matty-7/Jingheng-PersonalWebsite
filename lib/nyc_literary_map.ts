import { google_place_embed_url, google_place_url } from './google_maps';
import catalog from '@/content/nyc_literary_locations.json';

export type LiteraryCover = { src: string; alt: string; edition: string; source_url: string; credit: string };
export type LiteraryWork = { id: string; title: string; author: string; year: number; kind: string; source_url: string; text_url: string; rights: string; cover: LiteraryCover | null };
export type LiteraryEntry = { id: string; place_id: string; work_id: string; place: string; area: string; coordinates: number[]; map_query: string; locator: string; source_url: string; excerpt: string; excerpt_kind: string; note: string; precision: string; visit_note: string; place_source_url?: string };

export const literary_works = catalog.works as LiteraryWork[];
export const literary_entries = catalog.entries as LiteraryEntry[];
export const literary_place_count = new Set(literary_entries.map((entry) => entry.place_id)).size;

export function entries_for_work(work_id: string) {
  return work_id === 'all' ? literary_entries : literary_entries.filter((entry) => entry.work_id === work_id);
}

export function search_literary_entries(work_id: string, query: string) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return entries_for_work(work_id).filter((entry) => {
    const work = literary_works.find((item) => item.id === entry.work_id)!;
    const text = `${work.title} ${work.author} ${entry.place} ${entry.area}`.toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export function literary_maps_url(entry: LiteraryEntry) {
  return google_place_url(entry.map_query);
}

export function literary_embed_url(entry: LiteraryEntry, api_key: string) {
  return google_place_embed_url(entry.map_query, api_key, 15);
}
