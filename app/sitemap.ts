import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/') },
    { url: absoluteUrl('/portfolio/mortgage-map') },
    { url: absoluteUrl('/portfolio/nyc-film-map') },
  ];
}
