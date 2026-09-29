import type { MortgageLessonData } from './mortgage_lesson';

export function create_lesson_loader(initial_lesson: MortgageLessonData) {
  const cache = new Map([[initial_lesson.concept.id, initial_lesson]]);
  const pending = new Map<
    string,
    { promise: Promise<MortgageLessonData>; controller: AbortController }
  >();

  function load(id: string): MortgageLessonData | Promise<MortgageLessonData> {
    const cached = cache.get(id);
    if (cached) return cached;
    const existing = pending.get(id);
    if (existing) return existing.promise;
    const controller = new AbortController();
    const promise = fetch(
      `/api/mortgage-lesson?concept=${encodeURIComponent(id)}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error('Lesson unavailable');
        const lesson: MortgageLessonData = await response.json();
        controller.signal.throwIfAborted();
        if (lesson?.concept?.id !== id || !lesson.check || !lesson.sources)
          throw new Error('Mismatched lesson');
        cache.set(id, lesson);
        return lesson;
      })
      .finally(() => {
        if (pending.get(id)?.controller === controller) pending.delete(id);
      });
    pending.set(id, { promise, controller });
    return promise;
  }

  function prefetch(id: string) {
    if (pending.size >= 2 || cache.has(id)) return;
    void Promise.resolve(load(id)).catch(() => {});
  }

  function dispose() {
    for (const request of pending.values()) request.controller.abort();
    pending.clear();
  }
  return { load, prefetch, dispose };
}
