import {
  mortgage_branches,
  mortgage_concepts,
  mortgage_paths,
} from '../content/mortgage_concepts.ts';

export const mortgage_catalog_data = {
  branches: mortgage_branches,
  paths: mortgage_paths,
  concepts: mortgage_concepts.map(
    ({ id, title, subtitle, branch, summary, aliases }) => ({
      id,
      title,
      subtitle,
      branch,
      summary,
      aliases,
    }),
  ),
};
export type MortgageCatalogData = typeof mortgage_catalog_data;
