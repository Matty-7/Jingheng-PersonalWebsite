import { mortgage_sources } from '../content/mortgage_concepts.ts';
import { learning_checks, learning_index } from './mortgage_learning.ts';
import { render_mortgage_math } from './mortgage_math.ts';

const lessons = new Map<string, MortgageLessonData>();

export function mortgage_lesson(id: string): MortgageLessonData | null {
  const cached = lessons.get(id);
  if (cached) return cached;
  const concept = learning_index.get(id);
  if (!concept) return null;
  const lesson = {
    concept,
    check: learning_checks[id],
    sources: Object.fromEntries(
      concept.sources.map((key) => [key, mortgage_sources[key]]),
    ),
    formula: render_mortgage_math(id)[id] ?? null,
  };
  lessons.set(id, lesson);
  return lesson;
}

export type MortgageLessonData = {
  concept: NonNullable<ReturnType<typeof learning_index.get>>;
  check: (typeof learning_checks)[string];
  sources: typeof mortgage_sources;
  formula: ReturnType<typeof render_mortgage_math>[string] | null;
};
