import type { AtlasDetail } from './atlas_browser';
import type { MusicTrack } from './nyc_music_map';

type AtlasSource = {
  kind: 'image' | 'scene' | 'cover' | 'text' | 'place' | 'connection' | 'track';
  url: string;
  label: string;
};

export function source_url_key(value: string) {
  const url = new URL(value);
  url.hash = '';
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  url.search = new URLSearchParams(
    [...url.searchParams].filter(
      ([key]) => !/^utm_/i.test(key) && !['fbclid', 'gclid'].includes(key),
    ),
  ).toString();
  url.searchParams.sort();
  return url.href;
}

export function atlas_music_platform_urls(track: MusicTrack) {
  return {
    apple: track.apple_music_url,
    spotify: `https://open.spotify.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`,
  };
}

export function atlas_story_sources(detail: AtlasDetail): AtlasSource[] {
  const { entry, connection, sources } = detail;
  const candidates: AtlasSource[] = [];
  const seen = new Set<string>();
  if (entry.medium === 'film') {
    if (entry.scene.still)
      candidates.push({
        kind: 'image',
        url: entry.scene.still.source_url,
        label: entry.scene.still.kind ? 'Image source' : 'Frame source',
      });
    for (const id of entry.scene.source_ids) {
      const source = sources.find((item) => item.id === id);
      if (source) candidates.push({ ...source, kind: 'scene' });
    }
  } else if (entry.medium === 'literature') {
    const { work, passage } = entry;
    if (work.cover)
      candidates.push({
        kind: 'cover',
        url: work.cover.source_url,
        label: 'Cover source',
      });
    candidates.push({
      kind: 'text',
      url: passage.source_url,
      label: 'Read the source',
    });
    if (passage.place_source_url)
      candidates.push({
        kind: 'place',
        url: passage.place_source_url,
        label: 'Location reference',
      });
  } else {
    for (const url of Object.values(atlas_music_platform_urls(entry.track)))
      seen.add(source_url_key(url));
    if (connection)
      candidates.push({
        kind: 'connection',
        url: connection.source_url,
        label: connection.source_label,
      });
    candidates.push({
      kind: 'track',
      url: entry.track.source_url,
      label: entry.track.source_label,
    });
  }
  return candidates.filter(({ url }) => {
    const key = source_url_key(url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
