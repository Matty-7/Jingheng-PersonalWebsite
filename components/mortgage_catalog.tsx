'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Search, X } from 'lucide-react';
import {
  mortgage_branches,
  mortgage_concepts,
  mortgage_paths,
} from '@/content/mortgage_concepts';
import { search_concepts } from '@/lib/mortgage_graph';
import { learning_routes } from '@/lib/mortgage_learning';

export function MortgageCatalog({
  close,
  choose,
  choose_route,
  completed,
}: {
  close: () => void;
  choose: (id: string) => void;
  choose_route: (id: string) => void;
  completed: string[];
}) {
  const dialog_ref = useRef<HTMLDialogElement>(null);
  const [query, set_query] = useState('');
  const [section, set_section] = useState<'topics' | 'routes'>('topics');
  const matches = query.trim() ? search_concepts(query) : [];
  useEffect(() => {
    const dialog = dialog_ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={dialog_ref}
      className="learning-catalog"
      aria-labelledby="catalog-title"
      onCancel={close}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          return;
        }
        if (event.key !== 'Tab') return;
        const dialog = event.currentTarget;
        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, input, summary, a[href], [tabindex]',
          ),
        ).filter(
          (control) =>
            control.tabIndex >= 0 &&
            !control.matches(':disabled') &&
            control.getClientRects().length > 0,
        );
        const first = controls[0];
        const last = controls.at(-1);
        const active = dialog.ownerDocument.activeElement;
        const target = event.shiftKey
          ? active === first && last
          : active === last && first;
        if (target) {
          event.preventDefault();
          target.focus();
        }
      }}
    >
      <div className="learning-catalog-inner">
        <header>
          <div>
            <p className="learning-eyebrow">MORTGAGE MAP</p>
            <h2 id="catalog-title">Explore at your own pace.</h2>
          </div>
          <button
            className="learning-icon-button"
            aria-label="Close all topics"
            onClick={close}
          >
            <X size={22} />
          </button>
        </header>
        <div className="learning-catalog-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search mortgage concepts"
            placeholder="Find a concept, e.g. OAS"
            value={query}
            onChange={(event) => set_query(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && matches[0]) {
                event.preventDefault();
                choose(matches[0].id);
              }
            }}
            autoFocus
          />
        </div>
        {query.trim() ? (
          <div className="learning-search-results" aria-label="Search results">
            <p aria-live="polite">
              {matches.length
                ? `${matches.length} matching concepts`
                : 'No match. Try a shorter term.'}
            </p>
            {matches.map((concept) => (
              <button key={concept.id} onClick={() => choose(concept.id)}>
                <span>
                  <strong>{concept.title}</strong>
                  <small>{concept.subtitle}</small>
                </span>
                {completed.includes(concept.id) ? (
                  <Check size={17} aria-label="Understood" />
                ) : (
                  <ArrowRight size={17} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <>
            <fieldset
              className="learning-catalog-tabs"
              aria-label="Browse the map"
            >
              <button
                aria-pressed={section === 'topics'}
                onClick={() => set_section('topics')}
              >
                All topics
              </button>
              <button
                aria-pressed={section === 'routes'}
                onClick={() => set_section('routes')}
              >
                Learning routes
              </button>
            </fieldset>
            <p className="learning-catalog-note">
              Every concept is open. Lines suggest a study order, not
              prerequisites.
            </p>
            {section === 'topics' ? (
              <div className="learning-domains">
                {mortgage_branches.map((domain) => (
                  <details key={domain.id}>
                    <summary>
                      <span>{domain.number}</span>
                      <strong>{domain.title}</strong>
                      <ChevronDown size={17} aria-hidden="true" />
                    </summary>
                    <div>
                      {mortgage_concepts
                        .filter((concept) => concept.branch === domain.id)
                        .map((concept) => (
                          <button
                            key={concept.id}
                            onClick={() => choose(concept.id)}
                          >
                            {concept.title}
                            {completed.includes(concept.id) ? (
                              <Check size={15} aria-label="Understood" />
                            ) : (
                              <ArrowRight size={15} aria-hidden="true" />
                            )}
                          </button>
                        ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="learning-route-list">
                {[learning_routes[0], ...mortgage_paths].map((route) => (
                  <button key={route.id} onClick={() => choose_route(route.id)}>
                    <span>
                      <strong>{route.title}</strong>
                      <small>
                        {
                          route.steps.filter((id) => completed.includes(id))
                            .length
                        }{' '}
                        of {route.steps.length} understood
                      </small>
                    </span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
