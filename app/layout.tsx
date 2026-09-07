import type { Metadata } from 'next';
import profile from '@/content/profile.json';
import { pageMetadata, siteTitle } from '@/lib/seo';
import './globals.css';
export const metadata: Metadata = {
  ...pageMetadata(siteTitle, profile.description, '/'),
  metadataBase: new URL(profile.siteUrl),
  authors: [{ name: profile.name }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
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
