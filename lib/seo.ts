import type { Metadata } from 'next';
import profile from '@/content/profile.json';

export const siteTitle = 'Jingheng Huan';
export const absoluteUrl = (path: string) =>
  new URL(path, `${profile.siteUrl}/`).href;
export const personId = `${profile.siteUrl}/#person`;
export const websiteId = `${profile.siteUrl}/#website`;

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  article?: { publishedTime: string },
): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      types: { 'application/rss+xml': absoluteUrl('/feed.xml') },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: profile.name,
      locale: 'en_US',
      ...(article
        ? {
            type: 'article' as const,
            publishedTime: article.publishedTime,
            authors: [profile.siteUrl],
          }
        : { type: 'website' as const }),
    },
    twitter: { card: 'summary', title, description },
  };
}

export const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': personId,
      name: profile.name,
      alternateName: [profile.creatorName, profile.chineseName],
      url: absoluteUrl('/'),
      description: profile.bio,
      sameAs: [
        profile.links.linkedin,
        profile.links.github,
        profile.links.youtube,
        profile.links.instagram,
        profile.links.douban,
      ],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: profile.name,
      alternateName: [profile.creatorName, 'jinghenghuan.com'],
      url: absoluteUrl('/'),
      description: profile.description,
      inLanguage: 'en-US',
      publisher: { '@id': personId },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${profile.siteUrl}/#profile`,
      url: absoluteUrl('/'),
      name: profile.name,
      mainEntity: { '@id': personId },
      isPartOf: { '@id': websiteId },
    },
  ],
};

export const serializeStructuredData = (data: unknown) =>
  JSON.stringify(data).replace(/</g, '\\u003c');
