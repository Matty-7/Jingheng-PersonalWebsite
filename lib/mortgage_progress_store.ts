import {
  progress_key,
  type LearningModel,
  type LearningProgress,
} from './mortgage_learning_state.ts';
import type { MortgageLessonData } from './mortgage_lesson';
import { create_lesson_loader } from './mortgage_lesson_loader.ts';

export function create_learning_store(
  initial_progress: LearningProgress,
  initial_lesson: MortgageLessonData,
  model: LearningModel,
) {
  const server_snapshot = {
    progress: initial_progress,
    lesson: initial_lesson,
    loaded: false,
    has_committed: false,
    pending_id: null as string | null,
    failed: false,
  };
  let snapshot = server_snapshot;
  let initialized = false;
  let version = 0;
  let retry_request: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const loader = create_lesson_loader(initial_lesson);
  const notify = () => listeners.forEach((listener) => listener());

  function set_progress(
    update:
      | LearningProgress
      | ((current: LearningProgress) => LearningProgress),
    on_commit?: () => void,
  ) {
    const next =
      typeof update === 'function' ? update(snapshot.progress) : update;
    const ticket = ++version;
    const commit = (lesson: MortgageLessonData) => {
      if (ticket !== version) return;
      snapshot = {
        progress: next,
        lesson,
        loaded: true,
        has_committed: true,
        pending_id: null,
        failed: false,
      };
      retry_request = undefined;
      on_commit?.();
      notify();
    };
    const result = loader.load(next.current_id);
    if (!('then' in result)) {
      commit(result);
      return;
    }
    snapshot = { ...snapshot, pending_id: next.current_id, failed: false };
    retry_request = () => set_progress(next, on_commit);
    notify();
    void result.then(commit, () => {
      if (ticket !== version) return;
      snapshot = { ...snapshot, loaded: true, failed: true };
      notify();
    });
  }

  function restore_location() {
    if (location.pathname !== '/portfolio/mortgage-map') return;
    const url = new URL(location.href);
    const id =
      new URLSearchParams(url.hash.slice(1)).get('concept') ??
      url.searchParams.get('concept');
    set_progress((current) =>
      model.select_lesson(
        current,
        id ?? initial_progress.current_id,
        history.state?.learning_route,
      ),
    );
  }

  function initialize() {
    if (initialized) return;
    initialized = true;
    let saved = initial_progress;
    try {
      const stored = localStorage.getItem(progress_key);
      if (stored) saved = model.read_progress(stored);
    } catch {
      /* The server lesson works without browser storage. */
    }
    const url = new URL(location.href);
    const id =
      new URLSearchParams(url.hash.slice(1)).get('concept') ??
      url.searchParams.get('concept') ??
      saved.current_id;
    set_progress(model.select_lesson(saved, id));
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
      window.addEventListener('popstate', restore_location);
      window.addEventListener('hashchange', restore_location);
    }
    initialize();
    return () => {
      listeners.delete(listener);
      if (!listeners.size) {
        window.removeEventListener('popstate', restore_location);
        window.removeEventListener('hashchange', restore_location);
        ++version;
        loader.dispose();
        initialized = false;
      }
    };
  }
  return {
    get_snapshot: () => snapshot,
    get_server_snapshot: () => server_snapshot,
    subscribe,
    set_progress,
    prefetch: loader.prefetch,
    retry: () => retry_request?.(),
  };
}
