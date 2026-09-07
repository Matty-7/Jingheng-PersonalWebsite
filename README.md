# An Afternoon Uptown

Jingheng Huan’s illustrated digital living room: selected work, ten records, ten films, ten books, Broadway, and life on the Upper East Side.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npx tsc --noEmit
npm run build
```

## Experience

- Normal vertical scrolling drives the room zoom, section reveals and the pinned film-wall journey. There is no scroll-position slider or wheel interception.
- The record player streams real Apple-provided previews. Play, pause, previous and next controls share one audio element with the persistent mini-player. Music does not start on arrival or on scrolling.
- Full songs open in Apple Music. Preview playback does not imply full-track licensing or an Apple Music subscription. The owner chose previews for this first version; MusicKit account integration is not enabled.
- All ten films use official source posters: seven receive a light impressionist treatment; Before Sunrise, Mulholland Dr. and Her retain their unmodified originals because the image service rejected those edits. Provenance is recorded in `content/film-sources.json`. These are edited source posters, not original replacement illustrations.
- Mobile and reduced-motion layouts use a reading-friendly film grid. Content stays available without animation.
- A feature-detected WebMCP `select_record` tool selects a record without playing sound. The ordinary interface works without WebMCP.

## Content

Edit `content/music.json`, `content/films.json`, and `content/books.json`. Each main collection contains exactly ten entries. `content/broadway.json` is a separate intermission. `docs/content-direction.md` retains the wider set of preferences for later curation.

Music metadata and previews come from the US Apple catalog. Availability can change. Album art and film posters belong to their respective rights holders; this repository does not claim ownership of them. Original files and generated full-resolution working images are kept outside the checkout; the repository includes web-sized display assets and provenance.

The site displays only the neighborhood and city, never a residential street address. It contains no API keys or Apple authentication secrets.

## Project

Built with React, TypeScript and Vinext using the Sites starter. Vendored Shadcn primitives remain unchanged and are excluded from application lint; the full project is typechecked. Hosting configuration is in `.openai/hosting.json`. Source is maintained at https://github.com/Matty-7/an-afternoon-uptown.
