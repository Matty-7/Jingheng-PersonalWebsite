import type { Metadata } from 'next';
import profile from '@/content/profile.json';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Jingheng Huan', template: '%s' },
  description: profile.description,
  metadataBase: new URL(profile.siteUrl),
  authors: [{ name: profile.name }],
  openGraph: {
    type: 'website',
    siteName: profile.name,
    title: profile.name,
    description: profile.description,
  },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/feed.xml' },
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
