import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const learning_profiles = sqliteTable('learning_profiles', {
  owner_key: text('owner_key').primaryKey(),
  route_id: text('route_id').notNull(),
  current_id: text('current_id').notNull(),
  updated_at: integer('updated_at').notNull(),
});

export const learning_items = sqliteTable(
  'learning_items',
  {
    owner_key: text('owner_key').notNull(),
    concept_id: text('concept_id').notNull(),
    understood: integer('understood').notNull().default(0),
    answer_choice: integer('answer_choice'),
    question_version: text('question_version'),
    updated_at: integer('updated_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.owner_key, table.concept_id] })],
);
