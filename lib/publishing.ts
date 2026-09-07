import rawPosts from '@/content/posts.json';
import profile from '@/content/profile.json';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  kind: 'Essay' | 'Note' | 'Letter';
  status: 'draft' | 'published';
  paragraphs: string[];
};
const posts: Post[] = rawPosts as Post[];
export const publishedPosts = posts
  .filter(
    (post) =>
      post.status === 'published' &&
      new Date(`${post.date}T00:00:00Z`).getTime() <= Date.now(),
  )
  .sort((a, b) => b.date.localeCompare(a.date));
export const newsletterUrl: string | null = profile.newsletterUrl;
export const formatDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
