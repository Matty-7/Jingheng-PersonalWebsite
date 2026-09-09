import rawPosts from '@/content/newsletter_links.json';
import profile from '@/content/profile.json';
import { get_published_posts } from '@/lib/post_visibility';

export type Post = {
  slug: string;
  title: string;
  date: string;
  kind: 'Essay' | 'Note' | 'Letter';
  status: 'draft' | 'published';
  external_url: string;
};
const posts: Post[] = rawPosts as Post[];
// Resolve visibility during each request, never against the Worker startup clock.
export const get_visible_posts = () => get_published_posts(posts);
export const newsletterUrl: string | null = profile.newsletterUrl;
export const formatDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
