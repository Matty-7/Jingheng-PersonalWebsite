import type { AtlasLens } from '@/content/fixed_income_lenses';
import { lens_catalog } from '@/lib/mortgage_graph';
import { ArrowUpRight } from 'lucide-react';
import { concept_index } from '@/lib/mortgage_graph';

export function MortgageList({
  lens,
  branch_filter,
  selected,
  choose_concept,
}: {
  lens: AtlasLens;
  branch_filter: string;
  selected: string | null;
  choose_concept: (id: string, trigger?: HTMLButtonElement) => void;
}) {
  const { branches: mortgage_branches, topics: mortgage_topics } = lens_catalog(lens);
  const visible_topics = mortgage_topics.filter(
    (t) => branch_filter === 'all' || t.branch === branch_filter,
  );
  return (
    <div
      className="atlas-list"
      aria-label="Mortgage concepts by domain and topic"
    >
      {mortgage_branches
        .filter((b) => branch_filter === 'all' || b.id === branch_filter)
        .map((branch) => (
          <section key={branch.id} className="atlas-list-domain">
            <header>
              <span>{branch.number}</span>
              <h2>{branch.title}</h2>
              <p>{branch.question}</p>
            </header>
            {visible_topics
              .filter((t) => t.branch === branch.id)
              .map((topic) => (
                <div className="atlas-list-topic" key={topic.id}>
                  <h3>{topic.title}</h3>
                  <div>
                    {topic.concepts.map((id) => {
                      const node = concept_index.get(id)!;
                      return (
                        <button
                          key={id}
                          aria-pressed={selected === id}
                          onClick={(e) => choose_concept(id, e.currentTarget)}
                        >
                          <span>{node.title}</span>
                          <small>{node.subtitle}</small>
                          <ArrowUpRight size={15} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </section>
        ))}
    </div>
  );
}
