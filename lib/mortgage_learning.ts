import {
  mortgage_concepts,
  mortgage_paths,
  mortgage_topics,
} from '../content/mortgage_concepts.ts';
import {
  create_learning_model,
  type LearningRoute,
} from './mortgage_learning_state.ts';
export {
  initial_progress,
  position_cookie,
  progress_key,
  refinancing_feedback,
} from './mortgage_learning_state.ts';
export type {
  LearningProgress,
  LearningRoute,
} from './mortgage_learning_state.ts';
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
export const learning_navigation = mortgage_concepts.map(
  ({ id, title, subtitle, topic, links }) => ({
    id,
    title,
    subtitle,
    topic,
    links: links.map(({ id }) => ({ id })),
  }),
);
export const {
  route_index,
  read_progress,
  read_position,
  route_for_concept,
  select_lesson,
  next_lesson,
  local_tree,
} = create_learning_model(learning_navigation, learning_routes);
export { learning_checks } from '../content/mortgage_checks.ts';
