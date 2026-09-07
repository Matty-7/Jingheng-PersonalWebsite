# Jingheng Huan

Jingheng's English personal website: selected work, YouTube, Talking Laughs, a journal, and an illustrated New York living room with ten records, ten films, and ten books.

The website is named for its owner. The repository retains its original technical name so existing clones and source integrations keep working.

## Development

```sh
npm ci
npm run dev
```

## Content and publishing

- `content/profile.json`: identity, profile links, site origin, optional newsletter URL.
- `content/projects.json`: selected work. Add real projects here; the homepage renders them automatically.
- `content/channels.json`: YouTube and podcast information, with verified podcast episode links. English episode titles are editorial translations of the original Mandarin titles.
- `content/posts.json`: journal essays, notes and letters. Published entries appear at `/journal`, `/journal/[slug]`, and `/feed.xml`.
- `content/books.json`: ten covers, edition details, and short notes for the bookshelf.
- `content/music.json`: ten real Apple preview URLs and full-song links. Preview availability can change; graceful failure links remain available.
- `content/films.json` and the `*-sources.json` files: featured artwork and provenance.

See [the publishing guide](docs/publishing.md) for the update process. There is no hosted CMS or newsletter delivery service connected yet; publishing happens through this repository. No invented posts, subscriber counts, or fake sign-up form are shipped.

## Checks

```sh
npm run lint
npx tsc --noEmit
node scripts/check-content.mjs
npm run build
```

Built with React, TypeScript and Vinext. Hosting configuration is in `.openai/hosting.json`. Source: https://github.com/Matty-7/an-afternoon-uptown
