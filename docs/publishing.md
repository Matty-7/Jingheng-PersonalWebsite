# Publishing on Jingheng Huan’s website

The website is maintained through reviewed source changes. Substack hosts the current articles and sends the newsletter; this repository maintains their public index and the site’s collections.

## Journal and newsletter

Edit `content/newsletter_links.json`, the runtime input to `lib/publishing.ts`. Each entry has `slug`, `title`, ISO `date`, `kind` (`Essay`, `Note`, or `Letter`), `status` (`draft` or `published`) and a verified HTTPS `external_url`. Preserve the author’s approved title, date and destination. Add an entry only for an actual owner-approved article.

- `/journal` permanently redirects to the configured Substack publication, without an intermediate listing page. It returns 404 if no publication is configured.
- `/journal/[slug]` redirects to the visible entry’s external article; it does not render an essay from local blocks.
- `/feed.xml` includes visible entries and their external destinations; its channel link points directly to the publication.
- The sitemap includes the homepage and Mortgage Mind Map, omitting redirected Journal routes.
- `lib/post_visibility.ts` filters drafts and future dates. Visibility is resolved at request time, not at Worker initialization.
- `lib/newsletter_schema.ts` validates the same link-only records in the build and runtime: trimmed titles, unique kebab-case slugs, real `YYYY-MM-DD` dates, supported kind/status and HTTPS destinations on the configured provider origin. Unknown fields, including prose, are rejected. A build error names the record; runtime filtering removes malformed records and every conflicting duplicate without exposing them publicly.

`content/posts.json` contains legacy, owner-approved essay text. It is not the current Journal source. Preserve that text and do not import it into client components or restore it to public pages as part of routine maintenance. A draft flag controls site visibility, not source-repository privacy.

`content/profile.json` has the real `newsletterUrl` and profile links. Substack owns subscriber storage and email delivery. The website does not collect email addresses or send newsletters. There is no automatic feed-import or scheduled email job in this repository.

The first three homepage navigation links open YouTube, the verified podcast destination and the newsletter directly in new tabs. Channel cards and footer links share those destinations. Newsletter links appear only when a publication is configured.

## Projects

The current Projects section is authored in `app/page.tsx`. `content/mortgage_domains.ts` supplies its lightweight domain entrances and three-step map preview. The legacy `content/projects.json` does not automatically render on the homepage.

Mortgage Mind Map lives at `/portfolio/mortgage-map`; keep that established URL even though its visible navigation says Projects. Its concepts, comparisons and relationships are assembled by `content/mortgage_concepts.ts`; see [the map guide](mortgage_map.md). The withdrawn `/lab/mortgage` stays unlinked, absent from the sitemap and unavailable.

## YouTube and Talking Laughs

`content/channels.json` maintains the channel description and manually curated episode links. The verified YouTube name is Matty Huan, handle @MattyHuan. Talking Laughs is co-hosted with Jason and recorded in Mandarin. Episode titles on this English site are editorial translations; preserve actual source links and dates.

The supplied [Talking Laughs RSS feed](https://feed.xyzfm.space/urynb8y6tke7) was rechecked on September 13, 2026 and contains two episodes. Its channel link points to Xiaoyuzhou and it supplies no Apple Podcasts show URL. An RSS subscription URL and an Apple directory listing are distinct. Keep the verified listening link until an exact Apple show page can be verified; never substitute a namesake show. Update matching profile links when a listening destination changes.

## Collections and artwork

Maintain ten books in `content/books.json`, ten songs in `content/music.json`, ten films in `content/films.json`, and five Broadway Playbills. Preserve the broader preferences in `docs/content-direction.md` and artwork provenance in the source manifests.

Keep real Apple preview audio and full-song links, with graceful handling when streaming is unavailable. Book covers are actual publisher artwork. Memento and the alternate French Lovers on the Bridge poster were resized only, and must not be described as Impressionist edits.

## Review and publish

Run the checks in README and follow [the agent workflow](agent_workflow.md). Merge the independently reviewed PR into `main`; the existing publisher then deploys and verifies the checked source. A source branch or saved Site version alone is not a deployment. Preserve the standing public identity, article approval, draft visibility and withdrawn-project constraints.
