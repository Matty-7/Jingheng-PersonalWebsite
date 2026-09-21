import { readFile, writeFile } from 'node:fs/promises';

const catalog_url = new URL('../content/nyc_music_map.json', import.meta.url);
const summary_url = new URL(
  '../content/nyc_music_map_summary.json',
  import.meta.url,
);

export async function check_music_map_summary() {
  const [catalog, summary] = await Promise.all(
    [catalog_url, summary_url].map(async (url) =>
      JSON.parse(await readFile(url, 'utf8')),
    ),
  );
  if (
    summary.track_count !== catalog.tracks.length ||
    summary.place_count !== catalog.places.length
  ) {
    throw new Error('Music map summary is stale. Run npm run content:summary.');
  }
}

if (process.argv.includes('--write')) {
  const catalog = JSON.parse(await readFile(catalog_url, 'utf8'));
  await writeFile(
    summary_url,
    JSON.stringify(
      {
        track_count: catalog.tracks.length,
        place_count: catalog.places.length,
      },
      null,
      2,
    ) + '\n',
  );
}
