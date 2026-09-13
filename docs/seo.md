# Search and indexing

The canonical site is https://www.jinghenghuan.com/. The apex domain and the previous Sites origin permanently redirect to it, preserving paths and query strings.

## Implemented

- Server-rendered page titles, descriptions and canonical URLs for the home page and Mortgage Map. The homepage description identifies the author, writing topics, map and collections; HTML, Open Graph, Twitter and WebSite structured data share the same source in `content/profile.json`.
- Person, WebSite and ProfilePage structured data connect Jingheng Huan with Matty Huan and his public profiles, including Substack.
- `/robots.txt` allows crawling and points to `/sitemap.xml`.
- The sitemap contains only the canonical homepage and `/portfolio/mortgage-map`, the two indexable local pages.
- `/journal` permanently redirects to Substack. Published `/journal/[slug]` addresses permanently redirect to their corresponding external articles; they do not render local essays or BlogPosting data and are excluded from the sitemap.
- `/feed.xml` lists published external article links. Drafts and future-dated entries are excluded; unavailable article URLs return 404 with noindex.
- The public GitHub README links to the live website.

## Google Search Console

The project records verification of the `jinghenghuan.com` Domain property through a Porkbun DNS TXT record on September 7, 2026. Keep the `google-site-verification` TXT record in DNS so ownership stays verified. It covers the apex, www and both HTTP/HTTPS schemes. The September 13 SEO review did not reverify account ownership or read private Search Console reports.

Check that https://www.jinghenghuan.com/sitemap.xml is submitted successfully in the Sitemaps report. Use URL Inspection for the canonical homepage and Mortgage Map to check indexing, last crawl time and Google's selected canonical. Run a live test and request indexing when a page is absent or its indexed copy is outdated. A successful submission is a request, not proof that Google has indexed or ranked the site.

Substack is a separate property: use the URL-prefix property `https://jinghenghuan.substack.com/` and a verification method supported by both its current settings and Search Console. Ownership of `jinghenghuan.com` does not verify the Substack subdomain. Check the publication's actual sitemap before submitting it. Google Analytics measures visits; configuring it is not an indexing request.

## Substack metadata handoff, September 13, 2026

Status: **NOT APPLIED**. These proposed SEO fields are ready for the publication settings; this repository does not control Substack metadata. Backend access and rendered-page verification are still required. Keep existing display titles, subtitles, author-approved prose and published URLs unchanged. Enter only the SEO title and SEO description under each post's SEO options. Do not resend the newsletter.

| Published article | SEO title | SEO description |
| --- | --- | --- |
| [Something of My Own](https://jinghenghuan.substack.com/p/something-of-my-own) | Something of My Own: Identity and Writing \| Jingheng Huan | Jingheng Huan reflects on identity beyond institutions and on building something personal through writing and creative work. |
| [Across the Water](https://jinghenghuan.substack.com/p/across-the-water) | Across the Water: Governors Island \| Jingheng Huan | A trip to Governors Island offers Jingheng Huan a different view of New York, from the ferry crossing to an afternoon away from Manhattan. |
| [Which Rate?](https://jinghenghuan.substack.com/p/which-rate) | Which Rate? Understanding Treasury Yields \| Jingheng Huan | Jingheng Huan explores why two-, ten-, and thirty-year Treasury yields move differently, and what headlines about rising interest rates leave out. |
| [From the Stands](https://jinghenghuan.substack.com/p/from-the-stands) | From the Stands: My First US Open \| Jingheng Huan | At his first US Open, Jingheng Huan considers ticket prices, the crowd and souvenirs, and compares the evening with a visit to the Shanghai Masters. |
| [September 11 in New York](https://jinghenghuan.substack.com/p/september-11-in-new-york) | September 11 in New York: A Volunteer's View \| Jingheng Huan | Jingheng Huan writes about volunteering at New York's September 11 anniversary ceremony, visiting the museum and ending the day at Yankee Stadium. |

Suggested publication description: `Essays by Jingheng Huan on financial markets, life in New York, and the experiences that shape his thinking.` Keep the publication name and author name consistent with Jingheng Huan. On its About page, provide a natural, clickable link to the canonical personal website. Profile edits on LinkedIn, Instagram and other services require their own authenticated access and are not performed by this repository.

After saving each post, verify its public HTML title and description and record which entries were applied. If a platform appends the author name automatically, avoid duplicating it in the final rendered title. Search engines can rewrite titles and snippets, and metadata changes do not guarantee rankings.

## After publishing

1. Add genuine articles and projects through the existing content workflow. Keep public titles and descriptions specific and accurate.
2. Run `node scripts/check-seo.mjs` with the development server's printed URL. Pass the production URL to also check domain redirects after publishing.
3. Check Search Console's Pages and Performance reports after Google has processed the site. Repeated indexing requests for the same URL do not accelerate crawling.
4. Link to the canonical site from the owner's LinkedIn, YouTube, Instagram and podcast profiles when updating those profiles.

There are no purchased links, fabricated articles, keyword-stuffed pages, tracking accounts or invented engagement statistics. Google controls crawling, inclusion and ranking; new sites may take days to weeks to be crawled.

References: [Google's indexing request guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [profile structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [Substack's SEO settings guide](https://on.substack.com/p/substack-seo-guide).
