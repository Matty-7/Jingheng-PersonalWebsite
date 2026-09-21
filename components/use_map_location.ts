'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { map_location_url, type MapLocationCodec } from '@/lib/map_location';

export function useMapLocation<State>(codec: MapLocationCodec<State>) {
  const [state, set_state] = useState(codec.initial_state);
  const [ready, set_ready] = useState(false);
  const current = useRef(codec.initial_state);
  const initialized = useRef(false);

  useEffect(() => {
    const restore = () => {
      const next = codec.read(new URL(window.location.href).searchParams);
      current.current = next;
      set_state(next);
      const url = map_location_url(
        window.location.href,
        codec.keys,
        codec.write(next),
      );
      if (url.href !== window.location.href) {
        window.history.replaceState(window.history.state, '', url);
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
      if (!initialized.current) return;
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
        window.history[history_mode === 'push' ? 'pushState' : 'replaceState'](
          window.history.state,
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
