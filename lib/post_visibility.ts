type Publication = {
  status: 'draft' | 'published';
  date: string;
};

export function get_published_posts<T extends Publication>(
  posts: readonly T[],
  now = Date.now(),
): T[] {
  return posts
    .filter(
      (post) =>
        post.status === 'published' &&
        Date.parse(`${post.date}T00:00:00Z`) <= now,
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}
