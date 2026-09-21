import { env } from 'cloudflare:workers';

export function google_maps_embed_key(): string {
  const bindings = env as { GOOGLE_MAPS_EMBED_API_KEY?: string };
  return bindings.GOOGLE_MAPS_EMBED_API_KEY ?? '';
}
