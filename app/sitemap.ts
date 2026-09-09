import type { MetadataRoute } from 'next';
import { get_visible_posts } from '@/lib/publishing';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/') },
    { url: absoluteUrl('/journal') },
    ...get_visible_posts().map((post) => ({
      url: absoluteUrl(`/journal/${post.slug}`),
    })),
  ];
}
