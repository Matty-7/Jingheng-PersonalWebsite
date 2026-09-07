import { publishedPosts } from '@/lib/publishing';
import profile from '@/content/profile.json';
const xml = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]!,
  );
export function GET() {
  const items = publishedPosts
    .map(
      (post) =>
        `<item><title>${xml(post.title)}</title><link>${profile.siteUrl}/journal/${post.slug}</link><guid isPermaLink="true">${profile.siteUrl}/journal/${post.slug}</guid><pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate><description>${xml(post.excerpt)}</description></item>`,
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Jingheng Huan — Journal</title><link>${profile.siteUrl}/journal</link><description>Essays, notes, and letters from Jingheng Huan.</description><language>en-us</language><atom:link href="${profile.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`,
    {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
}
