// Strict $0 policy: external Google Maps URLs never carry an API key.
export function google_place_url(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
