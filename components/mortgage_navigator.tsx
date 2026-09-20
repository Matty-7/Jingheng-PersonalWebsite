import { mortgage_branches, mortgage_topics } from '@/content/mortgage_concepts';
import { useEffect, useId, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { concept_index } from '@/lib/mortgage_graph';

export function MortgageNavigator({
  branch,
  topic,
  expanded_by_default,
  show_scale_hint,
  open_branch,
  open_topic,
  choose_concept,
  overview,
}: {
  branch: string;
  topic: string;
  expanded_by_default: boolean;
  show_scale_hint: boolean;
  open_branch: (id: string) => void;
  open_topic: (id: string, branch: string) => void;
  choose_concept: (id: string, trigger?: HTMLButtonElement) => void;
  overview: () => void;
}) {
  const domain = mortgage_branches.find((b) => b.id === branch);
  const group = mortgage_topics.find((t) => t.id === topic);
  const [browse_open, set_browse_open] = useState(expanded_by_default);
  const panel_id = useId();
  useEffect(() => {
    const narrow_screen = window.matchMedia('(max-width: 800px)');
    function expand_on_narrow_screen() {
      if (narrow_screen.matches) set_browse_open(true);
    }
    expand_on_narrow_screen();
    narrow_screen.addEventListener('change', expand_on_narrow_screen);
    return () =>
      narrow_screen.removeEventListener('change', expand_on_narrow_screen);
  }, []);
  return (
    <nav className="atlas-browse" aria-label="Browse map at readable size">
      <div className="atlas-browse-header">
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
        <button
          className="atlas-disclosure"
          aria-expanded={browse_open}
          aria-controls={panel_id}
          onClick={() => set_browse_open(!browse_open)}
        >
          Browse {!domain ? 'domains' : !group ? 'topics' : 'concepts'}
          <ChevronDown size={15} />
        </button>
      </div>
      <div id={panel_id} className="atlas-browse-panel" hidden={!browse_open}>
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
        {show_scale_hint && (
          <p className="atlas-scale-hint">
            Zoom in to read, or switch to List.
          </p>
        )}
      </div>
    </nav>
  );
}
