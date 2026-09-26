export function normalize_search_text(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[’‘]/g, "'")
    .toLocaleLowerCase();
}
