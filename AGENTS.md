# Jingheng Huan: project conventions

- The identity is Jingheng Huan (郇敬恒). YouTube, Talking Laughs and Newsletters are equal publishing channels before the taste collections. The owner removed the projects section; code belongs on his linked GitHub and LinkedIn profiles.
- Maintain actual book covers on the bookshelf, with keyboard/touch-accessible selection. Never turn it into a ranking.
- Journal content is maintained in content/posts.json; drafts and future-dated entries must stay out of public routes and RSS. Do not import the posts file or lib/publishing into client components.
- Newsletter links appear only when profile.newsletterUrl is configured to a real provider. Do not add a nonfunctional sign-up form.

- Website copy is English, except the owner-approved bilingual name animation (Jingheng Huan / 郇敬恒). Maintain the sunny digital living room direction, with mid-century furniture and editorial illustration.
- The visitor scrolls the page normally. Do not add a scroll-simulation slider, intercept wheel events, or require dragging to browse the collections.
- Keep exactly ten featured films, ten books and ten songs in their content files. Preserve the broader preference list in docs/content-direction.md.
- Film imagery uses recognizable official source posters with a light impressionist treatment. Keep source provenance. Do not substitute new symbolic illustration concepts.
- Audio controls must operate real playback. Default is user-initiated Apple preview streaming and links to full songs. Keep one audio element across section changes, and label previews honestly.
- Do not add geographic slogans to the hero or restore the removed city chapter. Never add a home street address. Preserve geographic detail in owner-authored essays.
- Keep secrets and private signing keys out of source, media, logs and Git history.
- Preserve keyboard use, readable static content, responsive layouts and reduced-motion behavior.
- Run npm run lint, npx tsc --noEmit, npm test, node scripts/check-content.mjs and npm run build after substantive changes. Vendored components/ui and hooks/use-mobile.ts are excluded from application lint and should not be edited for routine styling.
- Do not claim animation, MusicKit integration, or browser checks that were not implemented or performed.

## Four-role collaboration

For substantive development, follow `docs/agent_workflow.md`: design critic, design editor, engineer, regression reviewer, then critic closure. The Site-owning parent acts as engineer and is the only writer to the checkout and the only agent that commits, pushes, opens PRs, or saves/deploys Sites. Spawn bounded read-only critique/design/review tasks; those agents may message one another. Asset agents return files outside the checkout for the owner to integrate.

Use snake_case for new helpers and task files, preserve framework-required naming, and avoid gratuitous renaming of existing code. Keep prose understated, avoid generic personal-brand slogans, and preserve the author's voice.

## Autonomous review, merge and deployment

On September 7, 2026, Jingheng explicitly authorized the full critic -> design editor -> engineer -> independent PR reviewer -> merge -> public deploy -> critic loop, including current PR #1. Passing independent review and required checks authorize the engineer to merge the reviewed PR into `main` and deploy it without another conversational confirmation. This supersedes the earlier instruction that only deployment after a user-performed merge was authorized.

Use `docs/agent_workflow.md` and the role briefs in `docs/agent_roles.md`. Keep this existing Site, domain and public audience. Routine code quality, accessibility, performance and layout improvements are in scope; preserve the author's approved article text and established design direction. Only make changes that have evidence and an accepted spec. If no worthwhile issue remains, record that outcome and leave the site unchanged.

Observe the exact merged revision and terminal deployment result before beginning the next critique. Respect platform access controls and branch protection; report a concrete blocker if they prevent completion. Do not change permissions or bypass a rejected action. This standing merge and publish authorization remains in effect until Jingheng changes it.

On September 8, 2026, Jingheng requested optimization of the workflow itself and authorized the proposed actual browser inspection. Follow `docs/site_audit.md`: the parent performs supported browser checks and supplies evidence to the read-only agents. Distinguish production HTTP checks from source-preview interaction tests. Keep merge-triggered publication separate from the recurring audit. NO_CHANGE ends one dated audit, never the recurring task; an incomplete inspection is PARTIAL or BLOCKED. Future routine audits may not rewrite these gates, automation configuration, permissions or their own acceptance criteria to obtain a pass.
