'use client';

import { useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
import {
  mortgage_sources,
  type MortgageConcept,
} from '@/content/mortgage_concepts';
import {
  learning_checks,
  learning_index,
  refinancing_feedback,
} from '@/lib/mortgage_learning';
import type { MortgageFormulas } from '@/lib/mortgage_math';

export function MortgageLesson({
  concept,
  formulas,
  completed,
  complete,
  choose,
}: {
  concept: MortgageConcept;
  formulas: MortgageFormulas;
  completed: boolean;
  complete: () => void;
  choose: (id: string) => void;
}) {
  const activity_ref = useRef<HTMLDivElement>(null);
  const has_demo = concept.id === 'incentive' || concept.id === 'lock_in';
  const [phase, set_phase] = useState<'explore' | 'check'>(
    has_demo ? 'explore' : 'check',
  );
  const [new_rate, set_new_rate] = useState(5);
  const [answer, set_answer] = useState<number | null>(null);
  const [lesson_id, set_lesson_id] = useState(concept.id);
  if (lesson_id !== concept.id) {
    set_lesson_id(concept.id);
    set_phase(has_demo ? 'explore' : 'check');
    set_new_rate(5);
    set_answer(null);
  }
  const check = learning_checks[concept.id];
  const correct = answer === check.correct;
  const feedback = refinancing_feedback(new_rate);
  const formula = formulas[concept.id];
  const heading =
    concept.id === 'incentive'
      ? 'When does refinancing make sense?'
      : concept.title;
  return (
    <>
      <section className="learning-stage" aria-label="Current lesson">
        <div className="learning-copy">
          <p className="learning-eyebrow">{concept.title}</p>
          <h2 id="learning-title" tabIndex={-1}>
            {heading}
          </h2>
          <p className="learning-summary">
            {concept.id === 'incentive'
              ? 'A lower new rate can make replacing a mortgage more attractive.'
              : concept.summary}
          </p>
          <details key={concept.id} className="learning-depth">
            <summary>
              Why it matters <ChevronDown size={17} aria-hidden="true" />
            </summary>
            <p>{concept.distinction}</p>
            {concept.id === 'incentive' && <p>{concept.summary}</p>}
            {concept.formula && formula && (
              <div className="learning-formula">
                <div
                  className="learning-math"
                  dangerouslySetInnerHTML={{ __html: formula.html }}
                />
                <p>{formula.variables}</p>
                <p>{concept.formula.assumptions}</p>
                {concept.formula.example && <p>{concept.formula.example}</p>}
              </div>
            )}
            <div className="learning-sources">
              <h3>Sources</h3>
              {concept.sources.map((id) => {
                const source = mortgage_sources[id];
                return (
                  <a
                    key={id}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.publisher}
                    <ArrowUpRight size={14} aria-hidden="true" />
                    <small>{source.title}</small>
                  </a>
                );
              })}
            </div>
            <div className="learning-related">
              <h3>Explore further</h3>
              {concept.links.map((link) => (
                <button key={link.id} onClick={() => choose(link.id)}>
                  {learning_index.get(link.id)?.title}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
          </details>
        </div>
        <div ref={activity_ref} className="learning-activity">
          {phase === 'explore' ? (
            <>
              <div className="learning-rates">
                <div>
                  <span>Your mortgage</span>
                  <strong>
                    6.5<span>%</span>
                  </strong>
                </div>
                <div>
                  <span>New mortgage</span>
                  <strong className="learning-new-rate">
                    {new_rate.toFixed(1)}
                    <span>%</span>
                  </strong>
                </div>
              </div>
              <div className="learning-slider">
                <label htmlFor="new-mortgage-rate">
                  Try a different new rate
                </label>
                <input
                  id="new-mortgage-rate"
                  type="range"
                  min="3"
                  max="9"
                  step="0.1"
                  value={new_rate}
                  onChange={(event) => set_new_rate(Number(event.target.value))}
                  aria-valuetext={`${new_rate.toFixed(1)} percent`}
                />
                <div>
                  <span>3%</span>
                  <span>Illustrative rates</span>
                  <span>9%</span>
                </div>
              </div>
              <div className="learning-feedback" aria-live="polite">
                <TrendingUp size={25} aria-hidden="true" />
                <div>
                  <strong>{feedback.title}</strong>
                  <p>{feedback.detail}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="learning-check">
              <p className="learning-eyebrow">CHECK YOUR UNDERSTANDING</p>
              <h3 tabIndex={-1}>{concept.question}</h3>
              <fieldset
                className="learning-choices"
                aria-label="Choose an answer"
              >
                {check.choices.map((choice, index) => (
                  <button
                    key={choice}
                    aria-pressed={answer === index}
                    className={
                      answer === index
                        ? correct
                          ? 'is-correct'
                          : 'is-incorrect'
                        : ''
                    }
                    onClick={() => set_answer(index)}
                  >
                    {answer === index && correct ? (
                      <Check size={18} aria-hidden="true" />
                    ) : (
                      <span
                        className="learning-choice-dot"
                        aria-hidden="true"
                      />
                    )}
                    {choice}
                  </button>
                ))}
              </fieldset>
              {answer !== null && (
                <div className="learning-answer" aria-live="polite">
                  <strong>
                    {correct
                      ? 'That’s right.'
                      : 'Not quite. Try another answer.'}
                  </strong>
                  <p>{concept.answer}</p>
                </div>
              )}
              {has_demo && (
                <button
                  className="learning-text-button learning-back-example"
                  onClick={() => set_phase('explore')}
                >
                  Back to the example
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      <footer className="learning-footer">
        {phase === 'explore' ? (
          <button
            className="learning-primary"
            onClick={() => {
              set_phase('check');
              requestAnimationFrame(() =>
                activity_ref.current
                  ?.querySelector<HTMLElement>('h3')
                  ?.focus({ preventScroll: true }),
              );
            }}
          >
            Check understanding <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button
            className="learning-primary"
            disabled={!correct}
            onClick={complete}
          >
            {completed ? 'Continue learning' : 'Mark understood & continue'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </footer>
    </>
  );
}
