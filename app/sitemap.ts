import type { MetadataRoute } from 'next';
import { publishedPosts } from '@/lib/publishing';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/') },
    { url: absoluteUrl('/journal') },
    ...publishedPosts.map((post) => ({
      url: absoluteUrl(`/journal/${post.slug}`),
    })),
  ];
}
