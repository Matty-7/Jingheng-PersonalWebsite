'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { map_location_url, type MapLocationCodec } from '@/lib/map_location';

export function useMapLocation<State>(codec: MapLocationCodec<State>) {
  const [state, set_state] = useState(codec.initial_state);
  const [ready, set_ready] = useState(false);
  const current = useRef(codec.initial_state);
  const initialized = useRef(false);
  const owner_path = useRef<string | null>(null);

  useEffect(() => {
    const pathname = window.location.pathname;
    owner_path.current = pathname;
    const restore = () => {
      // A route transition can dispatch popstate before this map unmounts.
      if (window.location.pathname !== pathname) return;
      const next = codec.read(new URL(window.location.href).searchParams);
      current.current = next;
      set_state(next);
      const url = map_location_url(
        window.location.href,
        codec.keys,
        codec.write(next),
      );
      if (url.href !== window.location.href) {
        window.history.replaceState(null, '', url);
      }
      initialized.current = true;
      set_ready(true);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [codec]);

  const update = useCallback(
    (
      change: State | ((previous: State) => State),
      history_mode: 'push' | 'replace' = 'push',
    ) => {
      if (
        !initialized.current ||
        window.location.pathname !== owner_path.current
      )
        return;
      const requested =
        typeof change === 'function'
          ? (change as (previous: State) => State)(current.current)
          : change;
      const next = codec.read(new URLSearchParams(codec.write(requested)));
      const url = map_location_url(
        window.location.href,
        codec.keys,
        codec.write(next),
      );
      if (url.href !== window.location.href) {
        // Let the framework's public History API preserve its routing metadata.
        window.history[history_mode === 'push' ? 'pushState' : 'replaceState'](
          null,
          '',
          url,
        );
      }
      current.current = next;
      set_state(next);
    },
    [codec],
  );

  return { state, update, ready };
}
