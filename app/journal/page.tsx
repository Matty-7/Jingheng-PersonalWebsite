import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import profile from '@/content/profile.json';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function Journal() {
  if (!profile.newsletterUrl) notFound();
  permanentRedirect(profile.newsletterUrl);
}
