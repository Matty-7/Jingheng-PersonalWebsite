import rawPosts from '@/content/posts.json';
import profile from '@/content/profile.json';
import { get_published_posts } from '@/lib/post_visibility';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  kind: 'Essay' | 'Note' | 'Letter';
  status: 'draft' | 'published';
  blocks: { type: 'paragraph' | 'heading'; text: string }[];
};
const posts: Post[] = rawPosts as Post[];
export const publishedPosts = get_published_posts(posts);
export const newsletterUrl: string | null = profile.newsletterUrl;
export const formatDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
