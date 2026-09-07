import type { Metadata } from 'next';
import profile from '@/content/profile.json';
import { pageMetadata, siteTitle } from '@/lib/seo';
import './globals.css';
export const metadata: Metadata = {
  ...pageMetadata(siteTitle, profile.description, '/'),
  metadataBase: new URL(profile.siteUrl),
  authors: [{ name: profile.name }],
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
