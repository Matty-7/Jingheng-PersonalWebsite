# Publishing on Jingheng Huan's website

The site can grow without redesigning its homepage. Work, journal entries, channel links and the three collections have separate content files. Every update is reviewed, checked and published as a new site version.

## Add a journal entry

Add an object to the array in `content/posts.json`:

```json
{
  "slug": "your-article-slug",
  "title": "Your article title",
  "excerpt": "A short introduction in your own words.",
  "date": "2026-09-07",
  "kind": "Essay",
  "status": "draft",
  "blocks": [
    { "type": "paragraph", "text": "First paragraph." },
    { "type": "heading", "text": "A section title" },
    { "type": "paragraph", "text": "Second paragraph." }
  ]
}
```

This is a schema example, not a published article. Use a unique lowercase slug, an ISO date, and kind `Essay`, `Note`, or `Letter`. Blocks support paragraphs and section headings; text is escaped rather than interpreted as HTML. Change `status` to `published` when the actual text is ready. Journal routes and RSS filter out drafts and future dates. There are no example posts in the live data.

Never put confidential drafts into the repository: draft status hides them from public pages, but collaborators with source access can still read committed files. Keep the post data and publishing module in server components. The homepage does not import draft data into its client bundle.

The current workflow is repository-based. Edit content, run the checks in README, then publish a new version. There is no browser editor, scheduled publication job, or newsletter sending service. A scheduled date is a visibility guard, not a promise of an automatic email.

## Add a project

Add to `content/projects.json` with a unique `slug`, `title`, `category`, `description`, `url`, `linkLabel`, and `status`. Use an actual project URL when available. The existing Duber reference goes to the owner's LinkedIn profile because no separate verified project page was supplied.

## Newsletter

Choose a newsletter service when ready and set `newsletterUrl` in `content/profile.json` to its actual HTTPS subscription page. The homepage and journal then display subscription links. Until that URL exists, the site honestly says that a newsletter is planned and collects no email addresses. Subscriber storage and email sending belong to that service and are not implemented by this site.

## YouTube and Talking Laughs

The verified YouTube name is Matty Huan, handle @MattyHuan. No channel biography or invented video titles are included.

Talking Laughs is co-hosted with Jason and is in Mandarin. Two actual episodes were read from the supplied RSS feed on 2026-09-07. Their English titles are concise translations; source links and dates are preserved. To feature new episodes, check the source feed and update `content/channels.json`. Importing is intentionally manual at this stage; do not imply a live automatic sync.

## Artwork

Preserve `book-sources.json` and `film-sources.json` with source URLs, edition and treatment information. Cover images are real publisher artwork. The English Hemingway cover is the collection *The Snows of Kilimanjaro and Other Stories*. The Garden of Forking Paths is the exact-title Penguin Modern edition.

Memento and the alternate French Lovers on the Bridge poster use original theatrical artwork resized only. The image service refused the requested transformations; these two are not described as Impressionist edits.

## Public identity

Use Jingheng Huan as the site's title and name. Matty Huan is the creator channel name. Do not add a home address or location labels to the hero. Geographic details in owner-authored essays remain part of the original text.

## Draft imports

The Journal supports paragraph and section-heading blocks. When importing an owner-supplied document, retain the author's wording, remove exported comment anchors and the comment appendix, and do not silently apply suggestions inside comments. Confirm that full text may be stored in this public source repository before adding private document content. The owner explicitly approved committing both original essays to the public repository on September 7, 2026. *Something of My Own* and *Across the Water* are included with their original paragraphs and section headings. Only exported comment markers and the trailing comment appendix were removed. September 7 is their proposed website publication date, not a claimed document creation date. A source commit does not deploy the Site.
