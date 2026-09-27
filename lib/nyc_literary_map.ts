import { google_place_url } from './google_maps.ts';
import catalog from '../content/nyc_literary_locations.json' with { type: 'json' };

export type LiteraryCover = {
  src: string;
  alt: string;
  edition: string;
  source_url: string;
  credit: string;
};
export type LiteraryWork = {
  id: string;
  title: string;
  author: string;
  year: number;
  kind: string;
  source_url: string;
  text_url: string;
  rights: string;
  cover: LiteraryCover | null;
};
export type LiteraryEntry = {
  id: string;
  place_id: string;
  work_id: string;
  place: string;
  area: string;
  coordinates: number[];
  plus_code: string;
  map_query: string;
  locator: string;
  source_url: string;
  excerpt: string;
  excerpt_kind: string;
  note: string;
  precision: string;
  visit_note: string;
  place_source_url?: string;
};

export const literary_works = catalog.works as LiteraryWork[];
export const literary_entries = catalog.entries as LiteraryEntry[];

export function literary_maps_url(entry: LiteraryEntry) {
  return google_place_url(entry.coordinates.join(','));
}
