// Strict $0 policy: use the free Embed API only; never fall back to metered APIs.
export function google_place_embed_url(query: string, api_key: string, zoom = 15): string | null {
  if (!api_key.trim()) return null;
  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(api_key.trim())}&q=${encodeURIComponent(query)}&zoom=${zoom}`;
}

export function google_place_url(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
