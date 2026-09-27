import {
  mortgage_concepts,
  mortgage_paths,
  mortgage_topics,
} from '../content/mortgage_concepts.ts';

export type LearningRoute = { id: string; title: string; steps: string[] };
export const learning_routes: LearningRoute[] = [
  {
    id: 'borrower_decision',
    title: 'The borrower’s decision',
    steps: [
      'principal_interest',
      'fixed_arm',
      'incentive',
      'prepayments',
      'cash_flows',
    ],
  },
  ...mortgage_paths,
  ...mortgage_topics.map((topic) => ({
    id: `topic_${topic.id}`,
    title: topic.title,
    steps: topic.concepts,
  })),
];
export const learning_index = new Map(
  mortgage_concepts.map((concept) => [concept.id, concept]),
);
export const route_index = new Map(
  learning_routes.map((route) => [route.id, route]),
);
export const progress_key = 'mortgage-map-learning-v1';
export type LearningProgress = {
  route_id: string;
  current_id: string;
  completed: string[];
};
export const initial_progress: LearningProgress = {
  route_id: 'borrower_decision',
  current_id: 'incentive',
  completed: [],
};

export function read_progress(raw: string | null): LearningProgress {
  try {
    const data: unknown = JSON.parse(raw ?? 'null');
    if (!data || typeof data !== 'object') return initial_progress;
    const saved = data as Partial<LearningProgress>;
    const route =
      typeof saved.route_id === 'string'
        ? route_index.get(saved.route_id)
        : undefined;
    if (!route || !saved.current_id || !route.steps.includes(saved.current_id))
      return initial_progress;
    return {
      route_id: route.id,
      current_id: saved.current_id,
      completed: Array.isArray(saved.completed)
        ? [
            ...new Set(
              saved.completed.filter(
                (id) => typeof id === 'string' && learning_index.has(id),
              ),
            ),
          ]
        : [],
    };
  } catch {
    return initial_progress;
  }
}

export function route_for_concept(
  id: string,
  preferred?: string,
): LearningRoute {
  const route = preferred ? route_index.get(preferred) : undefined;
  if (route?.steps.includes(id)) return route;
  const concept = learning_index.get(id);
  return route_index.get(`topic_${concept?.topic}`) ?? learning_routes[0];
}

export function select_lesson(
  progress: LearningProgress,
  id: string,
  preferred = progress.route_id,
): LearningProgress {
  if (!learning_index.has(id)) return progress;
  return {
    ...progress,
    current_id: id,
    route_id: route_for_concept(id, preferred).id,
  };
}

export function next_lesson(
  route: LearningRoute,
  current_id: string,
  completed: string[],
): string | undefined {
  const index = route.steps.indexOf(current_id);
  return [...route.steps.slice(index + 1), ...route.steps.slice(0, index)].find(
    (id) => !completed.includes(id),
  );
}

export function local_tree(route: LearningRoute, selected: string) {
  const index = route.steps.indexOf(selected);
  const before = route.steps.slice(Math.max(0, index - 2), index);
  const after = route.steps.slice(index + 1, index + 3);
  const related = learning_index
    .get(selected)
    ?.links.find((link) => !route.steps.includes(link.id));
  const branch =
    selected === 'incentive' && !route.steps.includes('frictions')
      ? 'frictions'
      : related?.id;
  return {
    before,
    after,
    branch,
    ids: [...before, selected, ...after, ...(branch ? [branch] : [])],
  };
}

export function refinancing_feedback(new_rate: number, current_rate = 6.5) {
  if (new_rate < current_rate)
    return {
      title: 'Stronger incentive to refinance',
      detail:
        'A lower replacement rate may offer savings. Costs and eligibility still matter.',
    };
  if (new_rate > current_rate)
    return {
      title: 'Less incentive to replace the loan',
      detail:
        'Keeping the existing rate may be more attractive. Moving or borrowing needs can still lead to refinancing.',
    };
  return {
    title: 'No rate advantage',
    detail:
      'The rates match. Fees, loan terms and the borrower’s needs still affect the decision.',
  };
}

export { learning_checks } from '../content/mortgage_checks.ts';
