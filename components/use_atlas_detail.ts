'use client';

import { useEffect, useState } from 'react';
import type { AtlasDetail } from '@/lib/atlas_browser';

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
  const [failed_ids, set_failed_ids] = useState(() => new Set<string>());
  const detail = entry_id ? (details.get(entry_id) ?? null) : null;
  const failed = entry_id !== null && failed_ids.has(entry_id);

  useEffect(() => {
    if (!entry_id || detail || failed) return;
    const controller = new AbortController();
    let active = true;
    async function load_detail() {
      try {
        const response = await fetch(
          `/api/atlas-entry?entry=${encodeURIComponent(entry_id!)}`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          },
        );
        if (!response.ok) throw new Error('Atlas detail unavailable');
        const result: AtlasDetail = await response.json();
        if (result?.entry?.id !== entry_id)
          throw new Error('Mismatched Atlas detail');
        if (active)
          set_details((previous) => new Map(previous).set(entry_id!, result));
      } catch {
        if (active)
          set_failed_ids((previous) => new Set(previous).add(entry_id!));
      }
    }
    void load_detail();
    return () => {
      active = false;
      controller.abort();
    };
  }, [entry_id, detail, failed]);

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
  return { detail, failed, retry, preview_track };
}
