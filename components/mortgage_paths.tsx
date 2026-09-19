import { lens_definition, type AtlasLens } from '@/content/fixed_income_lenses';
import { expansion_paths } from '@/content/fixed_income_expansion';
import type { RefObject } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  mortgage_paths,
  mortgage_relationships,
} from '@/content/mortgage_concepts';
import { mechanism_models } from '@/content/mortgage_mechanisms';
import { analytics_paths } from '@/content/mortgage_analytics';
import { concept_index } from '@/lib/mortgage_graph';

export function MortgagePaths({
  lens,
  path_id,
  selected,
  reader_open,
  paths_ref,
  choose_path,
  choose_concept,
}: {
  lens: AtlasLens;
  path_id: string;
  selected: string | null;
  reader_open: boolean;
  paths_ref: RefObject<HTMLElement | null>;
  choose_path: (id: string) => void;
  choose_concept: (id: string, trigger?: HTMLButtonElement) => void;
}) {
  const path = mortgage_paths.find((item) => item.id === path_id);
  const model = [...mechanism_models, ...analytics_paths, ...expansion_paths].find((item) => item.id === path_id);
  const recommended = new Set<string>(lens_definition(lens).paths);
  const ordered_paths = [...mortgage_paths].sort((a, b) => Number(recommended.has(b.id)) - Number(recommended.has(a.id)));
  const step_index = Math.max(0, path?.steps.indexOf(selected ?? '') ?? 0);
  return (
    <section
      className="atlas-models"
      aria-label="Reading paths"
      key={path_id || 'path_index'}
      ref={paths_ref}
    >
      {path ? (
        <>
          <button className="atlas-text-button" onClick={() => choose_path('')}>
            <ArrowLeft size={15} /> All paths
          </button>
          <h2 tabIndex={-1}>{path.title}</h2>
          <p className="atlas-model-premise">
            {model?.premise ?? path.description}
          </p>
          {model && <div className="atlas-path-stepper" aria-label="Guided path controls">
            <div className="atlas-stepper-top">
              <span>Step {step_index + 1} of {path.steps.length}</span>
              <div>
                <button aria-label="Previous guided step" disabled={step_index === 0} onClick={() => choose_concept(path.steps[step_index - 1])}><ArrowLeft size={16} /></button>
                <button aria-label="Next guided step" disabled={step_index === path.steps.length - 1} onClick={() => choose_concept(path.steps[step_index + 1])}><ArrowRight size={16} /></button>
              </div>
            </div>
            <progress max={path.steps.length} value={step_index + 1} aria-label="Path position" />
            <div className="atlas-step-detail" key={path.steps[step_index]}>
              <button onClick={(e) => choose_concept(path.steps[step_index], e.currentTarget)}>{concept_index.get(path.steps[step_index])?.title}<ArrowUpRight size={16} /></button>
              <p>{model.explanations[step_index]}</p>
            </div>
          </div>}
          <ol className="atlas-model-steps">
            {path.steps.map((id, index) => {
              const node = concept_index.get(id)!;
              const previous = path.steps[index - 1];
              const edge = mortgage_relationships.find(
                (e) =>
                  (e.source === previous && e.target === id) ||
                  (e.source === id && e.target === previous),
              );
              return (
                <li key={id} className={index === step_index ? 'is-active-step' : undefined}>
                  <span className="atlas-step-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <button
                      onClick={(e) => choose_concept(id, e.currentTarget)}
                      aria-current={
                        selected === id && reader_open ? 'step' : undefined
                      }
                    >
                      {node.title}
                      <ArrowUpRight size={16} />
                    </button>
                    <p>
                      {model?.explanations[index] ??
                        (index === 0 ? node.summary : edge?.reason)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          {model && (
            <div className="atlas-model-boundary">
              <strong>Where this can change</strong>
              <p>{model.boundary}</p>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 tabIndex={-1}>Follow a mechanism.</h2>
          <p className="atlas-path-recommendation">Suggested starting points for {lens_definition(lens).title.toLowerCase()} appear first. Every path stays available.</p>
          <div className="atlas-model-cards">
            {ordered_paths.map((item, index) => (
              <button key={item.id} className={recommended.has(item.id) ? 'is-recommended' : undefined} onClick={() => choose_path(item.id)}>
                <span>
                  {String(index + 1).padStart(2, '0')}
                  <ArrowUpRight size={17} />
                </span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <small>{recommended.has(item.id) ? 'Suggested · ' : ''}{item.steps.length} concepts</small>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
