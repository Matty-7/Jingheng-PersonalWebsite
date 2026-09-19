import { expansion_paths } from '@/content/fixed_income_expansion';
import { concept_in_lens } from '@/content/fixed_income_lenses';
import type { RefObject } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Link2,
  Route,
  X,
} from 'lucide-react';
import {
  mortgage_branches,
  mortgage_paths,
  mortgage_sources,
  type MortgageConcept,
} from '@/content/mortgage_concepts';
import { concept_index, topic_index, study_edges } from '@/lib/mortgage_graph';
import type { ReadingTrail } from '@/lib/mortgage_reading';
import { MortgageCheck } from './mortgage_check';
import { MortgageRelations } from './mortgage_relations';

export type MortgageFormulas = Record<
  string,
  { html: string; tex: string; variables: string }
>;
const branch_index = new Map(
  mortgage_branches.map((branch) => [branch.id, branch]),
);

export function MortgageReader({
  concept,
  formulas,
  path_id,
  trail,
  reader_ref,
  link_status,
  close_reader,
  follow_history,
  copy_concept_link,
  choose_concept,
  show_paths,
  explore_connections,
}: {
  concept: MortgageConcept;
  formulas: MortgageFormulas;
  path_id: string;
  trail: ReadingTrail;
  reader_ref: RefObject<HTMLElement | null>;
  link_status: string;
  close_reader: () => void;
  follow_history: (offset: number) => void;
  copy_concept_link: () => Promise<void>;
  choose_concept: (id: string, trigger?: HTMLButtonElement) => void;
  show_paths: () => void;
  explore_connections: () => void;
}) {
  const path = mortgage_paths.find((item) => item.id === path_id);
  const model = expansion_paths.find(item => item.id === path_id);
  const shared_with_rates = concept_in_lens(concept, 'rates') && concept_in_lens(concept, 'mortgage');
  const relations = study_edges(concept.id);
  return (
    <aside
      className="atlas-reader"
      ref={reader_ref}
      aria-label="Concept reader"
    >
      <div className="atlas-reader-top">
        <span>
          {branch_index.get(concept.branch)?.number} /{' '}
          {branch_index.get(concept.branch)?.title}
        </span>
        <button onClick={close_reader} aria-label="Close concept reader">
          <X size={18} />
        </button>
      </div>
      <div className="atlas-reader-navigation" aria-label="Concept history">
        <button
          onClick={() => follow_history(-1)}
          disabled={trail.cursor <= 0}
          aria-label="Previous concept"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <button
          onClick={() => follow_history(1)}
          disabled={trail.cursor >= trail.ids.length - 1}
          aria-label="Next concept in history"
        >
          <ArrowRight size={15} />
        </button>
        <button onClick={copy_concept_link}>
          <Link2 size={14} /> Copy link
        </button>
        <output>{link_status}</output>
      </div>
      <p className="atlas-reader-topic">
        {topic_index.get(concept.topic)?.title}
      </p>
      <h2 tabIndex={-1}>{concept.title}</h2>
      {shared_with_rates && <p className="atlas-shared-label">Mortgage ↔ Rates</p>}
      <p className="atlas-reader-subtitle">{concept.subtitle}</p>
      <p className="atlas-reader-summary">{concept.summary}</p>
      {path && path.steps.includes(concept.id) && (
        <div className="atlas-reader-path">
          <button
            onClick={() => {
              show_paths();
            }}
          >
            <Route size={14} /> {path.title}
          </button>
          {model && <p className="atlas-reader-step-explanation">{model.explanations[path.steps.indexOf(concept.id)]}</p>}
          <div>
            <span>
              Step {path.steps.indexOf(concept.id) + 1} of {path.steps.length}
            </span>
            <button
              disabled={path.steps.indexOf(concept.id) === 0}
              onClick={() =>
                choose_concept(path.steps[path.steps.indexOf(concept.id) - 1])
              }
              aria-label="Previous path step"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              disabled={
                path.steps.indexOf(concept.id) === path.steps.length - 1
              }
              onClick={() =>
                choose_concept(path.steps[path.steps.indexOf(concept.id) + 1])
              }
              aria-label="Next path step"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
      {concept.formula && (
        <div className="atlas-formula">
          <span>THE RELATIONSHIP</span>
          <div
            className="atlas-math"
            dangerouslySetInnerHTML={{
              __html: formulas[concept.id].html,
            }}
          />
          <p className="atlas-math-variables">
            {formulas[concept.id].variables}
          </p>
          <small>{concept.formula.assumptions}</small>
          {concept.formula.example && (
            <p className="atlas-formula-example">{concept.formula.example}</p>
          )}
        </div>
      )}
      <div className="atlas-distinction">
        <span>KEEP THIS DISTINCTION</span>
        <p>{concept.distinction}</p>
      </div>
      <MortgageRelations
        relations={relations}
        choose_concept={choose_concept}
        explore={() => {
          explore_connections();
        }}
      />
      <MortgageCheck
        key={concept.id}
        id={concept.id}
        question={concept.question}
        answer={concept.answer}
      />
      <details className="atlas-further">
        <summary>
          Related reading <ChevronDown size={15} />
        </summary>
        {concept.links.map((link) => (
          <button
            key={link.id}
            onClick={(e) => choose_concept(link.id, e.currentTarget)}
          >
            <span>
              {concept_index.get(link.id)?.title} <ArrowUpRight size={13} />
            </span>
            <small>{link.reason}</small>
          </button>
        ))}
      </details>
      <section className="atlas-sources">
        <h3>Read the source</h3>
        {concept.sources.map((id) => {
          const source = mortgage_sources[id];
          return (
            <a key={id} href={source.url} target="_blank" rel="noreferrer">
              <span>
                {source.publisher}
                <ArrowUpRight size={14} />
              </span>
              <small>{source.title}</small>
            </a>
          );
        })}
      </section>
    </aside>
  );
}
