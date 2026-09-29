import { mortgage_concepts } from '../content/mortgage_concepts.ts';
import { search_catalog } from './mortgage_search_core.ts';

export const search_concepts = (query: string) =>
  search_catalog(mortgage_concepts, query);
