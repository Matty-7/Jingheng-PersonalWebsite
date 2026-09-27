'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { atlas_card_artwork, type AtlasDetail } from '@/lib/atlas_browser';

export function useAtlasDetail(
  entry_id: string | null,
  initial_detail: AtlasDetail | null,
) {
  const [details, set_details] = useState(
    () =>
      new Map(
        initial_detail ? [[initial_detail.entry.id, initial_detail]] : [],
      ),
  );
  const cache = useRef(details);
  const pending = useRef(
    new Map<
      string,
      { promise: Promise<AtlasDetail>; controller: AbortController }
    >(),
  );
  const [failed_ids, set_failed_ids] = useState(() => new Set<string>());
  const detail = entry_id ? (details.get(entry_id) ?? null) : null;
  const failed = entry_id !== null && failed_ids.has(entry_id);

  useEffect(() => {
    const requests = pending.current;
    return () => {
      for (const { controller } of requests.values()) controller.abort();
      requests.clear();
    };
  }, []);

  const load_detail = useCallback((id: string) => {
    const cached = cache.current.get(id);
    if (cached) return Promise.resolve(cached);
    const existing = pending.current.get(id);
    if (existing) return existing.promise;
    const controller = new AbortController();
    const promise = fetch(`/api/atlas-entry?entry=${encodeURIComponent(id)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Atlas detail unavailable');
        const result: AtlasDetail = await response.json();
        controller.signal.throwIfAborted();
        if (result?.entry?.id !== id)
          throw new Error('Mismatched Atlas detail');
        cache.current = new Map(cache.current).set(id, result);
        set_details(cache.current);
        return result;
      })
      .finally(() => {
        if (pending.current.get(id)?.controller === controller)
          pending.current.delete(id);
      });
    pending.current.set(id, { promise, controller });
    return promise;
  }, []);

  const prefetch_detail = useCallback(
    (id: string) => {
      // Only user intent starts speculative work; clicks are never queued behind it.
      if (pending.current.size >= 2 || cache.current.has(id)) return;
      void load_detail(id)
        .then((result) => {
          const artwork = atlas_card_artwork(result);
          if (!artwork?.src) return;
          const image = new Image();
          image.decoding = 'async';
          image.src = artwork.src;
        })
        .catch(() => {});
    },
    [load_detail],
  );

  useEffect(() => {
    if (!entry_id || detail || failed) return;
    let active = true;
    void load_detail(entry_id).catch(() => {
      if (active) set_failed_ids((previous) => new Set(previous).add(entry_id));
    });
    return () => {
      active = false;
    };
  }, [entry_id, detail, failed, load_detail]);

  function retry() {
    if (!entry_id) return;
    set_failed_ids((previous) => {
      const next = new Set(previous);
      next.delete(entry_id);
      return next;
    });
  }

  const recording = entry_id?.startsWith('music:')
    ? [...details.values()].find(
        (cached) =>
          cached.entry.medium === 'music' &&
          cached.entry.track.id === entry_id.split(':')[1],
      )?.entry
    : undefined;
  const preview_track =
    recording?.medium === 'music' ? recording.track : undefined;
  return { detail, failed, retry, preview_track, prefetch_detail };
}
