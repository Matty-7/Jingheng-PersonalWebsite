'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  progress_key,
  read_progress,
  select_lesson,
  type LearningProgress,
} from '@/lib/mortgage_learning';

function create_learning_store(initial_lesson: LearningProgress) {
  const server_snapshot = { progress: initial_lesson, loaded: false };
  let snapshot: typeof server_snapshot | undefined;
  const listeners = new Set<() => void>();

  function get_snapshot() {
    if (snapshot) return snapshot;
    let saved = initial_lesson;
    try {
      const stored = localStorage.getItem(progress_key);
      if (stored) saved = read_progress(stored);
    } catch {
      /* URL and server position remain usable without browser storage. */
    }
    const url = new URL(location.href);
    const id =
      new URLSearchParams(url.hash.slice(1)).get('concept') ??
      url.searchParams.get('concept') ??
      saved.current_id;
    snapshot = { progress: select_lesson(saved, id), loaded: true };
    return snapshot;
  }

  function set_progress(
    update:
      | LearningProgress
      | ((current: LearningProgress) => LearningProgress),
  ) {
    const current = get_snapshot().progress;
    snapshot = {
      progress: typeof update === 'function' ? update(current) : update,
      loaded: true,
    };
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    function restore_location() {
      if (location.pathname !== '/portfolio/mortgage-map') return;
      const url = new URL(location.href);
      const id =
        new URLSearchParams(url.hash.slice(1)).get('concept') ??
        url.searchParams.get('concept');
      set_progress((current) =>
        select_lesson(
          current,
          id ?? initial_lesson.current_id,
          history.state?.learning_route,
        ),
      );
    }
    window.addEventListener('popstate', restore_location);
    window.addEventListener('hashchange', restore_location);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('popstate', restore_location);
      window.removeEventListener('hashchange', restore_location);
    };
  }

  return {
    get_snapshot,
    get_server_snapshot: () => server_snapshot,
    subscribe,
    set_progress,
  };
}

export function useLearningProgress(initial_lesson: LearningProgress) {
  const [store] = useState(() => create_learning_store(initial_lesson));
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.get_snapshot,
    store.get_server_snapshot,
  );
  return { ...snapshot, set_progress: store.set_progress };
}
