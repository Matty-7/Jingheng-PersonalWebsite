import rawPosts from '@/content/newsletter_links.json';
import profile from '@/content/profile.json';
import { get_published_posts } from '@/lib/post_visibility';
import { validate_newsletter_links } from '@/lib/newsletter_schema';

const { links: posts } = validate_newsletter_links(
  rawPosts,
  profile.newsletterUrl,
);
// Resolve visibility during each request, never against the Worker startup clock.
export const get_visible_posts = () => get_published_posts(posts);
