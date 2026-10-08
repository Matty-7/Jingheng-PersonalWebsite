export type LearningRoute = { id: string; title: string; steps: string[] };
export type LearningNode = {
  id: string;
  title: string;
  subtitle: string;
  topic: string;
  links: { id: string }[];
};
export const progress_key = 'mortgage-map-learning-v1';
export const position_cookie = 'mortgage-map-position-v1';
export type LearningAnswer = { choice: number; version: string };
export type ProgressChanges = {
  completed: string[];
  answers: Record<string, LearningAnswer>;
  position?: { route_id: string; current_id: string };
  bootstrap?: boolean;
};
export function question_version(question: string, choices: string[]) {
  return JSON.stringify([question, ...choices]);
}
export type LearningProgress = {
  route_id: string;
  current_id: string;
  completed: string[];
  answers?: Record<string, LearningAnswer>;
};
export const initial_progress: LearningProgress = {
  route_id: 'borrower_decision',
  current_id: 'incentive',
  completed: [],
};

export function create_learning_model(
  nodes: LearningNode[],
  routes: LearningRoute[],
) {
  const learning_index = new Map(nodes.map((node) => [node.id, node]));
  const route_index = new Map(routes.map((route) => [route.id, route]));
  function read_progress(raw: string | null): LearningProgress {
    try {
      const data: unknown = JSON.parse(raw ?? 'null');
      if (!data || typeof data !== 'object') return initial_progress;
      const saved = data as Partial<LearningProgress>;
      const route =
        typeof saved.route_id === 'string'
          ? route_index.get(saved.route_id)
          : undefined;
      const current_id =
        typeof saved.current_id === 'string' &&
        learning_index.has(saved.current_id)
          ? saved.current_id
          : initial_progress.current_id;
      const restored_route = route?.steps.includes(current_id)
        ? route
        : route_for_concept(current_id, initial_progress.route_id);
      const answers = Object.fromEntries(
        Object.entries(saved.answers ?? {}).filter(
          ([id, answer]) =>
            learning_index.has(id) &&
            answer &&
            Number.isInteger(answer.choice) &&
            answer.choice >= 0 &&
            answer.choice < 3 &&
            typeof answer.version === 'string' &&
            answer.version.length < 10000,
        ),
      );
      return {
        route_id: restored_route.id,
        current_id,
        completed: Array.isArray(saved.completed)
          ? [
              ...new Set(
                saved.completed.filter(
                  (id) => typeof id === 'string' && learning_index.has(id),
                ),
              ),
            ]
          : [],
        ...(Object.keys(answers).length ? { answers } : {}),
      };
    } catch {
      return initial_progress;
    }
  }

  function read_position(raw: string | undefined): LearningProgress {
    try {
      return read_progress(raw ? decodeURIComponent(raw) : null);
    } catch {
      return initial_progress;
    }
  }

  function route_for_concept(id: string, preferred?: string): LearningRoute {
    const route = preferred ? route_index.get(preferred) : undefined;
    if (route?.steps.includes(id)) return route;
    const concept = learning_index.get(id);
    return route_index.get(`topic_${concept?.topic}`) ?? routes[0];
  }

  function select_lesson(
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

  function next_lesson(
    route: LearningRoute,
    current_id: string,
    completed: string[],
  ): string | undefined {
    const index = route.steps.indexOf(current_id);
    return [
      ...route.steps.slice(index + 1),
      ...route.steps.slice(0, index),
    ].find((id) => !completed.includes(id));
  }

  function local_tree(route: LearningRoute, selected: string) {
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

  return {
    learning_index,
    route_index,
    read_progress,
    read_position,
    route_for_concept,
    select_lesson,
    next_lesson,
    local_tree,
  };
}
export type LearningModel = ReturnType<typeof create_learning_model>;
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
