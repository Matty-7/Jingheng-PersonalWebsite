import { ArrowUpRight } from 'lucide-react';
import {
  mortgage_branches,
  mortgage_topics,
} from '@/content/mortgage_concepts';
import { concept_index } from '@/lib/mortgage_graph';

export function MortgageNavigator({
  branch,
  topic,
  open_branch,
  open_topic,
  choose_concept,
  overview,
}: {
  branch: string;
  topic: string;
  open_branch: (id: string) => void;
  open_topic: (id: string, branch: string) => void;
  choose_concept: (id: string, trigger?: HTMLButtonElement) => void;
  overview: () => void;
}) {
  const domain = mortgage_branches.find((b) => b.id === branch);
  const group = mortgage_topics.find((t) => t.id === topic);
  return (
    <nav className="atlas-browse" aria-label="Browse map at readable size">
      <div className="atlas-browse-trail">
        <button onClick={overview}>All domains</button>
        {domain && (
          <>
            <span>/</span>
            <button onClick={() => open_branch(domain.id)}>
              {domain.title}
            </button>
          </>
        )}
        {group && (
          <>
            <span>/</span>
            <span aria-current="location">{group.title}</span>
          </>
        )}
      </div>
      {domain && <p className="atlas-browse-question">{domain.question}</p>}
      <div className="atlas-browse-items">
        {!domain
          ? mortgage_branches.map((b) => (
              <button key={b.id} onClick={() => open_branch(b.id)}>
                <span className="atlas-browse-domain">
                  <strong>{b.title}</strong>
                  <small>{b.question}</small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))
          : !group
            ? mortgage_topics
                .filter((t) => t.branch === branch)
                .map((t) => (
                  <button key={t.id} onClick={() => open_topic(t.id, branch)}>
                    {t.title}
                    <ArrowUpRight size={14} />
                  </button>
                ))
            : group.concepts.map((id) => (
                <button
                  key={id}
                  onClick={(e) => choose_concept(id, e.currentTarget)}
                >
                  {concept_index.get(id)?.title}
                  <ArrowUpRight size={14} />
                </button>
              ))}
      </div>
    </nav>
  );
}
