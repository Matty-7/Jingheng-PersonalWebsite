# Jingheng Huan

Jingheng's English personal website: selected work, direct links to YouTube, Talking Laughs and Substack, and an illustrated living room with ten records, ten films, and ten books.

Visit **[www.jinghenghuan.com](https://www.jinghenghuan.com/)**.

The project name is `jingheng-personal-website`. The GitHub repository is `Matty-7/Jingheng-PersonalWebsite`. The existing domain and Sites identity are independent of that name.

## Development

Use Node.js 22.18 or later; the content checker imports the shared TypeScript schema directly.

```sh
npm ci
npm run dev
```

## Content and publishing

- `content/profile.json`: identity, profile links, site origin, optional newsletter URL.
- `app/page.tsx`: the current Projects section. Its Mortgage Map preview metadata is in `content/mortgage_domains.ts`. The legacy `content/projects.json` is not a live homepage source.
- `content/channels.json`: YouTube and podcast information, with verified podcast episode links. English episode titles are editorial translations of the original Mandarin titles.
- `content/newsletter_links.json`: the live Journal index. `lib/publishing.ts` filters draft and future entries at request time. `/journal/[slug]` redirects to the entry’s `external_url`; `/feed.xml` lists those external articles. Legacy essay text in `content/posts.json` is not rendered by these routes and must stay out of client imports.
- `lib/newsletter_schema.ts`: the shared build/runtime boundary for link metadata, real calendar dates, unique slugs and provider URLs. The build rejects invalid records; the runtime excludes invalid records and all members of a duplicate-slug group.
- `app/sitemap.ts` and `app/robots.ts`: search discovery, with only published journal entries included. See [search and indexing](docs/seo.md).
- `content/books.json`: ten covers, edition details, and short notes for the bookshelf.
- `content/music.json`: ten real Apple preview URLs and full-song links. Preview availability can change; graceful failure links remain available.
- `content/films.json` and the `*-sources.json` files: featured artwork and provenance.

See [the publishing guide](docs/publishing.md) for the update process. The configured newsletter is [Jingheng’s Substack](https://jinghenghuan.substack.com). This repository maintains the website’s article links; Substack hosts the articles and handles subscription and email delivery. No invented posts, subscriber counts, or fake sign-up form are shipped.

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

Built with React, TypeScript and Vinext. Hosting configuration is in `.openai/hosting.json`. Source: [Matty-7/Jingheng-PersonalWebsite](https://github.com/Matty-7/Jingheng-PersonalWebsite)

## Cloud development

Open a cloud Work conversation in the same ChatGPT account/workspace and ask to continue this Site, or use this repository and the current PR as the handoff. Code execution and builds run in the cloud; the Mac does not need to remain awake. Work availability depends on the account and app. Remote is a separate mode that controls a connected computer.

GitHub remains the code review history. Sites stores source versions and serves the existing domain. The four-role workflow reviews improvements and merges passing PRs into `main`. A separate merge-triggered publisher deploys the checked revision and verifies delivery; the daily visitor audit runs independently. Jingheng has authorized these merges and deployments without a separate confirmation. Pushing an unmerged branch or saving a Site version alone does not deploy it. Read [the agent workflow](docs/agent_workflow.md) before substantive changes.

Official guidance: https://learn.chatgpt.com/training/walkthroughs/working-on-your-phone
