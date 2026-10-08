'use client';

import { useState, useSyncExternalStore } from 'react';
import { create_learning_store } from '@/lib/mortgage_progress_store';
import type {
  LearningModel,
  LearningProgress,
} from '@/lib/mortgage_learning_state';
import type { MortgageLessonData } from '@/lib/mortgage_lesson';

export function useLearningProgress(
  initial_progress: LearningProgress,
  initial_lesson: MortgageLessonData,
  model: LearningModel,
) {
  const [store] = useState(() =>
    create_learning_store(initial_progress, initial_lesson, model),
  );
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.get_snapshot,
    store.get_server_snapshot,
  );
  return {
    ...snapshot,
    set_progress: store.set_progress,
    prefetch: store.prefetch,
    retry: store.retry,
    retry_save: store.retry_save,
  };
}
