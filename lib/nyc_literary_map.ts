import catalog from '../content/nyc_literary_locations.json';

export type LiteraryCover = { src: string; alt: string; edition: string; source_url: string; credit: string };
export type LiteraryWork = { id: string; title: string; author: string; year: number; kind: string; source_url: string; text_url: string; rights: string; cover: LiteraryCover | null };
export type LiteraryEntry = { id: string; work_id: string; place: string; area: string; coordinates: number[]; map_query: string; locator: string; source_url: string; excerpt: string; excerpt_kind: string; note: string; precision: string; visit_note: string; place_source_url?: string };

export const literary_works = catalog.works as LiteraryWork[];
export const literary_entries = catalog.entries as LiteraryEntry[];

export function entries_for_work(work_id: string) {
  return work_id === 'all' ? literary_entries : literary_entries.filter((entry) => entry.work_id === work_id);
}

export function literary_maps_url(entry: LiteraryEntry) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.map_query)}`;
}

export function literary_embed_url(entry: LiteraryEntry) {
  return `https://www.google.com/maps?q=${encodeURIComponent(entry.map_query)}&z=15&output=embed`;
}
