export type SearchableConcept = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  aliases: string[];
};

export function search_catalog<T extends SearchableConcept>(
  concepts: T[],
  query: string,
) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return concepts
    .map((n) => ({
      node: n,
      score:
        n.id === q || n.title.toLowerCase() === q
          ? 0
          : n.aliases.some((a) => a.toLowerCase() === q)
            ? 1
            : n.title.toLowerCase().startsWith(q)
              ? 2
              : n.title.toLowerCase().includes(q)
                ? 3
                : 4,
    }))
    .filter(({ node }) =>
      [node.id, node.title, node.subtitle, node.summary, ...node.aliases].some(
        (s) => s.toLowerCase().includes(q),
      ),
    )
    .sort(
      (a, b) => a.score - b.score || a.node.title.localeCompare(b.node.title),
    )
    .map(({ node }) => node);
}
