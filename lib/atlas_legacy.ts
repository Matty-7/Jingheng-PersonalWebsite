import { atlas_entries } from './new_york_atlas.ts';
import type { AtlasMedium } from './atlas_browser.ts';
import type { MapSearchParams } from './map_location.ts';

export function atlas_legacy_url(medium: AtlasMedium, search: MapSearchParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  const work = params.get(
    medium === 'film' ? 'film' : medium === 'music' ? 'track' : 'work',
  );
  const place = params.get('place');
  const passage = params.get('passage');
  const entries = atlas_entries.filter((entry) => entry.medium === medium);
  const selected = entries.find((entry) => {
    if (entry.medium === 'film')
      return (
        (!work || work === 'all' || entry.work.id === work) &&
        (!place || entry.location.id === place)
      );
    if (entry.medium === 'music')
      return (
        (!work || entry.track.id === work) &&
        (!place || entry.place.id === place)
      );
    return (
      (!work || work === 'all' || entry.work.id === work) &&
      (!passage || entry.passage.id === passage)
    );
  });
  for (const key of [
    'film',
    'track',
    'work',
    'place',
    'passage',
    'view',
    'entry',
  ])
    params.delete(key);
  params.set('medium', medium);
  if (((work && work !== 'all') || place || passage) && selected) {
    params.set('entry', selected.id);
    // A legacy selection takes precedence over a stale search filter.
    params.delete('q');
  }
  return `/portfolio/new-york-atlas?${params}`;
}
