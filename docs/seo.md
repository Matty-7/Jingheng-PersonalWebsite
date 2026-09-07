# Search and indexing

The canonical site is https://www.jinghenghuan.com/. The apex domain and the previous Sites origin permanently redirect to it, preserving paths and query strings.

## Implemented

- Server-rendered page titles, descriptions and canonical URLs for the home page, journal and published articles.
- Person, WebSite and ProfilePage structured data connecting Jingheng Huan with Matty Huan and his public profiles; published journal entries use BlogPosting data.
- `/robots.txt` allows crawling and points to `/sitemap.xml`.
- The sitemap automatically includes published journal articles. Drafts and future-dated posts are excluded, and unavailable article URLs return 404 with noindex.
- The public GitHub README links to the live website.

## Google Search Console

The `jinghenghuan.com` Domain property was verified through a Porkbun DNS TXT record on September 7, 2026. Keep the `google-site-verification` TXT record in DNS so ownership stays verified. It covers the apex, www and both HTTP/HTTPS schemes.

Submit https://www.jinghenghuan.com/sitemap.xml in the Sitemaps report. Use URL Inspection to inspect the canonical home page, run a live test, and request indexing. A successful submission is a request, not proof that Google has indexed or ranked the site.

## After publishing

1. Add genuine articles and projects through the existing content workflow. Keep public titles and descriptions specific and accurate.
2. Run `node scripts/check-seo.mjs` with the development server's printed URL. Pass the production URL to also check domain redirects after publishing.
3. Check Search Console's Pages and Performance reports after Google has processed the site. Repeated indexing requests for the same URL do not accelerate crawling.
4. Link to the canonical site from the owner's LinkedIn, YouTube, Instagram and podcast profiles when updating those profiles.

There are no purchased links, fabricated articles, keyword-stuffed pages, tracking accounts or invented engagement statistics. Google controls crawling, inclusion and ranking; new sites may take days to weeks to be crawled.

References: [Google's indexing request guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [profile structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page).
