import {
  progress_key,
  type LearningModel,
  type LearningProgress,
  type ProgressChanges,
} from './mortgage_learning_state.ts';

const sync_key = 'mortgage-map-sync-v1';
type SavedProgress = {
  progress: LearningProgress;
  owner_key: string;
  signed_in: boolean;
  saved_at: number | null;
  exists: boolean;
};
export type SaveState = {
  save_status: 'loading' | 'saving' | 'saved' | 'error';
  signed_in: boolean;
  saved_at: number | null;
};
const empty_changes = (): ProgressChanges => ({ completed: [], answers: {} });
const has_changes = (changes: ProgressChanges) =>
  Boolean(
    changes.position ||
    changes.completed.length ||
    Object.keys(changes.answers).length,
  );
function merge_changes(
  first: ProgressChanges,
  second: ProgressChanges,
): ProgressChanges {
  return {
    ...first,
    ...second,
    position: second.position ?? first.position,
    completed: [...new Set([...first.completed, ...second.completed])],
    answers: { ...first.answers, ...second.answers },
  };
}
function apply_changes(
  progress: LearningProgress,
  changes: ProgressChanges,
): LearningProgress {
  const answers = { ...progress.answers, ...changes.answers };
  return {
    ...progress,
    ...changes.position,
    completed: [...new Set([...progress.completed, ...changes.completed])],
    ...(Object.keys(answers).length ? { answers } : {}),
  };
}

export function create_progress_sync(
  model: LearningModel,
  on_restore: (progress: LearningProgress) => void,
  on_status: (state: SaveState) => void,
  fallback_progress: LearningProgress,
) {
  let owner_key: string | null = null;
  let signed_in = false;
  let saved_at: number | null = null;
  let pending = empty_changes();
  let inflight: ProgressChanges | null = null;
  let initialized = false;
  let loading = false;
  let active = false;
  let latest: LearningProgress | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let legacy: LearningProgress | null = null;
  let stored_owner: {
    owner_key: string;
    signed_in: boolean;
    pending: ProgressChanges;
  } | null = null;

  function status(save_status: SaveState['save_status']) {
    if (active) on_status({ save_status, signed_in, saved_at });
  }
  function cache() {
    try {
      if (latest) localStorage.setItem(progress_key, JSON.stringify(latest));
      const cache_owner = owner_key ?? stored_owner?.owner_key;
      if (cache_owner)
        localStorage.setItem(
          sync_key,
          JSON.stringify({
            owner_key: cache_owner,
            signed_in: owner_key ? signed_in : stored_owner?.signed_in,
            pending: merge_changes(
              !initialized
                ? (stored_owner?.pending ?? empty_changes())
                : (inflight ?? empty_changes()),
              pending,
            ),
          }),
        );
    } catch {
      /* The server copy remains authoritative when browser storage is unavailable. */
    }
  }
  async function fetch_progress(
    changes?: ProgressChanges,
  ): Promise<SavedProgress> {
    const response = await fetch('/api/mortgage-progress', {
      method: changes ? 'PUT' : 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(changes
        ? {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...changes, expected_owner_key: owner_key }),
            keepalive: JSON.stringify(changes).length < 60_000,
          }
        : {}),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Progress unavailable');
    return response.json() as Promise<SavedProgress>;
  }
  async function flush() {
    if (!initialized || inflight || !has_changes(pending)) return;
    inflight = pending;
    pending = empty_changes();
    cache();
    status('saving');
    try {
      const result = await fetch_progress(inflight);
      if (result.owner_key !== owner_key)
        throw new Error('Learning account changed');
      saved_at = result.saved_at;
      inflight = null;
      cache();
      status(has_changes(pending) ? 'saving' : 'saved');
      if (has_changes(pending)) void flush();
    } catch {
      pending = merge_changes(inflight ?? empty_changes(), pending);
      inflight = null;
      cache();
      status('error');
    }
  }
  async function restore() {
    if (loading) return;
    loading = true;
    status('loading');
    try {
      const result = await fetch_progress();
      owner_key = result.owner_key;
      signed_in = result.signed_in;
      saved_at = result.saved_at;
      let recovered = empty_changes();
      if (!stored_owner && legacy) {
        recovered = {
          completed: legacy.completed,
          answers: legacy.answers ?? {},
          ...(result.exists
            ? {}
            : {
                position: {
                  route_id: legacy.route_id,
                  current_id: legacy.current_id,
                },
              }),
          bootstrap: true,
        };
      } else if (
        stored_owner &&
        (stored_owner.owner_key === owner_key ||
          (!stored_owner.signed_in && signed_in))
      ) {
        recovered = stored_owner.pending;
      }
      pending = merge_changes(recovered, pending);
      initialized = true;
      latest = apply_changes(
        model.read_progress(JSON.stringify(result.progress)),
        pending,
      );
      if (active) on_restore(latest);
      cache();
      status(has_changes(pending) ? 'saving' : 'saved');
      if (has_changes(pending)) void flush();
    } catch {
      status('error');
    } finally {
      loading = false;
    }
  }
  function retry() {
    if (initialized) void flush();
    else void restore();
  }
  function start() {
    active = true;
    try {
      const raw = localStorage.getItem(progress_key);
      legacy = raw ? model.read_progress(raw) : fallback_progress;
      stored_owner = JSON.parse(localStorage.getItem(sync_key) ?? 'null');
      if (
        stored_owner &&
        (!stored_owner.owner_key ||
          !stored_owner.pending ||
          !Array.isArray(stored_owner.pending.completed) ||
          typeof stored_owner.pending.answers !== 'object')
      )
        stored_owner = null;
    } catch {
      stored_owner = null;
    }
    window.addEventListener('online', retry);
    window.addEventListener('pagehide', flush_on_exit);
    if (!initialized) void restore();
    else {
      status(has_changes(pending) ? 'saving' : 'saved');
      void flush();
    }
  }
  function flush_on_exit() {
    cache();
    void flush();
  }
  function changed(previous: LearningProgress, next: LearningProgress) {
    latest = next;
    const answers = Object.fromEntries(
      Object.entries(next.answers ?? {}).filter(
        ([id, answer]) =>
          JSON.stringify(previous.answers?.[id]) !== JSON.stringify(answer),
      ),
    );
    pending = merge_changes(pending, {
      completed: next.completed.filter(
        (id) => !previous.completed.includes(id),
      ),
      answers,
      ...(previous.current_id !== next.current_id ||
      previous.route_id !== next.route_id
        ? {
            position: { current_id: next.current_id, route_id: next.route_id },
            bootstrap: false,
          }
        : {}),
    });
    cache();
    if (has_changes(pending)) {
      status(initialized ? 'saving' : loading ? 'loading' : 'error');
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (initialized) void flush();
      }, 250);
    }
  }
  return {
    start,
    changed,
    retry,
    stop() {
      active = false;
      clearTimeout(timer);
      window.removeEventListener('online', retry);
      window.removeEventListener('pagehide', flush_on_exit);
      flush_on_exit();
    },
  };
}
