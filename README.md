# Jingheng Huan

Jingheng's English personal website: selected work, YouTube, Talking Laughs, a journal, and an illustrated living room with ten records, ten films, and ten books.

Visit **[www.jinghenghuan.com](https://www.jinghenghuan.com/)**.

The project name is `jingheng-personal-website`. The GitHub repository URL still uses `an-afternoon-uptown` until its owner completes the repository rename in Settings. The existing domain and Sites identity are independent of that name.

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
- `app/sitemap.ts` and `app/robots.ts`: search discovery, with only published journal entries included. See [search and indexing](docs/seo.md).
- `content/books.json`: ten covers, edition details, and short notes for the bookshelf.
- `content/music.json`: ten real Apple preview URLs and full-song links. Preview availability can change; graceful failure links remain available.
- `content/films.json` and the `*-sources.json` files: featured artwork and provenance.

See [the publishing guide](docs/publishing.md) for the update process. There is no hosted CMS or newsletter delivery service connected yet; publishing happens through this repository. No invented posts, subscriber counts, or fake sign-up form are shipped.

## Checks

```sh
npm run lint
npx tsc --noEmit
npm test
node scripts/check-content.mjs
npm run build
# With the development server running, use its printed URL:
node scripts/check-seo.mjs http://localhost:3001
```

Built with React, TypeScript and Vinext. Hosting configuration is in `.openai/hosting.json`. Source: https://github.com/Matty-7/an-afternoon-uptown

## Cloud development

Open a cloud Work conversation in the same ChatGPT account/workspace and ask to continue this Site, or use this repository and the current PR as the handoff. Code execution and builds run in the cloud; the Mac does not need to remain awake. Work availability depends on the account and app. Remote is a separate mode that controls a connected computer.

GitHub remains the code review history. Sites stores source versions and serves the existing domain. Neither pushing a PR nor saving a Site version deploys it. Read [the agent workflow](docs/agent_workflow.md) before substantive changes.

Official guidance: https://learn.chatgpt.com/training/walkthroughs/working-on-your-phone
