'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Check, ChevronDown, Circle, Search } from 'lucide-react';
import {
  initial_progress,
  learning_index,
  local_tree,
  next_lesson,
  progress_key,
  read_progress,
  route_for_concept,
  route_index,
  type LearningProgress,
} from '@/lib/mortgage_learning';
import { MortgageCatalog } from './mortgage_catalog';
import { MortgageLesson } from './mortgage_lesson';
import type { MortgageFormulas } from './mortgage_reader';

export function MortgageMap({
  formulas,
  home_link,
}: {
  formulas: MortgageFormulas;
  home_link: ReactNode;
}) {
  const [progress, set_progress] = useState<LearningProgress>(initial_progress);
  const [selected, set_selected] = useState(initial_progress.current_id);
  const [loaded, set_loaded] = useState(false);
  const [catalog_open, set_catalog_open] = useState(false);
  const [announcement, set_announcement] = useState('');
  const catalog_trigger = useRef<HTMLElement | null>(null);
  const map_ref = useRef<HTMLElement>(null);
  const tree_ref = useRef<HTMLElement>(null);
  const [connectors, set_connectors] = useState<string[]>([]);
  const concept = learning_index.get(selected)!;
  const route = route_for_concept(selected, progress.route_id);
  const tree = local_tree(route, selected);
  const is_detour = selected !== progress.current_id;
  const completed_count = route.steps.filter((id) =>
    progress.completed.includes(id),
  ).length;

  useEffect(() => {
    const tree_element = tree_ref.current;
    if (!tree_element) return;
    function measure_connections() {
      if (!tree_element) return;
      const bounds = tree_element.getBoundingClientRect();
      const pairs = [
        ['.node-before-0', '.node-current'],
        ['.node-before-1', '.node-current'],
        ['.node-current', '.node-after-0'],
        ['.node-after-0', '.node-after-1'],
        ['.node-current', '.node-branch'],
      ];
      const paths = pairs.flatMap(([from, to]) => {
        const source = tree_element.querySelector<HTMLElement>(from);
        const target = tree_element.querySelector<HTMLElement>(to);
        if (!source || !target || !source.offsetWidth || !target.offsetWidth)
          return [];
        const a = source.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const x1 = a.right - bounds.left;
        const y1 = a.top + a.height / 2 - bounds.top;
        const x2 = b.left - bounds.left;
        const y2 = b.top + b.height / 2 - bounds.top;
        const mid = (x1 + x2) / 2;
        return [`M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`];
      });
      set_connectors(paths);
    }
    const frame = requestAnimationFrame(measure_connections);
    const observer = new ResizeObserver(measure_connections);
    observer.observe(tree_element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [selected, route.id]);

  useEffect(() => {
    let saved = initial_progress;
    try {
      saved = read_progress(localStorage.getItem(progress_key));
    } catch {
      /* Learning works when browser storage is unavailable. */
    }
    const frame = requestAnimationFrame(() => {
      set_progress(saved);
      const from_hash = new URLSearchParams(location.hash.slice(1)).get(
        'concept',
      );
      set_selected(
        from_hash && learning_index.has(from_hash)
          ? from_hash
          : saved.current_id,
      );
      set_loaded(true);
    });
    function restore_location() {
      const id = new URLSearchParams(location.hash.slice(1)).get('concept');
      if (id && learning_index.has(id)) set_selected(id);
      else if (!id) {
        try {
          set_selected(
            read_progress(localStorage.getItem(progress_key)).current_id,
          );
        } catch {
          set_selected(saved.current_id);
        }
      }
    }
    window.addEventListener('popstate', restore_location);
    window.addEventListener('hashchange', restore_location);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('popstate', restore_location);
      window.removeEventListener('hashchange', restore_location);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(progress_key, JSON.stringify(progress));
    } catch {
      /* Progress remains available for this visit. */
    }
  }, [loaded, progress]);

  function focus_lesson() {
    requestAnimationFrame(() =>
      map_ref.current
        ?.querySelector<HTMLElement>('#learning-title')
        ?.focus({ preventScroll: true }),
    );
  }
  function choose(id: string) {
    if (!learning_index.has(id)) return;
    set_selected(id);
    set_catalog_open(false);
    const url = new URL(location.href);
    url.hash = `concept=${id}`;
    if (location.hash !== url.hash) history.pushState(null, '', url);
    focus_lesson();
  }
  function browse() {
    catalog_trigger.current = document.activeElement as HTMLElement;
    set_catalog_open(true);
  }
  function close_catalog() {
    set_catalog_open(false);
    requestAnimationFrame(() =>
      catalog_trigger.current?.focus({ preventScroll: true }),
    );
  }
  function choose_route(id: string) {
    const chosen = route_index.get(id);
    if (!chosen) return;
    const current_id =
      chosen.steps.find((step) => !progress.completed.includes(step)) ??
      chosen.steps[0];
    set_progress({ ...progress, route_id: chosen.id, current_id });
    choose(current_id);
  }
  function learn_from_here() {
    set_progress({ ...progress, route_id: route.id, current_id: selected });
    set_announcement(`Continuing from ${concept.title}.`);
  }
  function complete() {
    const completed = [...new Set([...progress.completed, selected])];
    if (is_detour) {
      set_progress({ ...progress, completed });
      set_announcement(
        `${concept.title} marked understood. Back to your learning path.`,
      );
      choose(progress.current_id);
      return;
    }
    const next = next_lesson(route, selected, completed);
    set_progress({ ...progress, completed, current_id: next ?? selected });
    set_announcement(
      next
        ? `${concept.title} marked understood. Next: ${learning_index.get(next)?.title}.`
        : `${route.title} complete. Choose another learning route whenever you’re ready.`,
    );
    if (next) choose(next);
    else browse();
  }

  return (
    <section
      ref={map_ref}
      className="mortgage-learning"
      aria-label="Interactive mortgage knowledge map"
      data-ready={loaded}
    >
      <header className="learning-header">
        <div className="learning-brand">
          {home_link}
          <h1>Mortgage Map</h1>
        </div>
        <nav aria-label="Map navigation">
          <button className="learning-text-button" onClick={browse}>
            All topics <ChevronDown size={16} aria-hidden="true" />
          </button>
          <button
            className="learning-icon-button"
            onClick={browse}
            aria-label="Search concepts"
          >
            <Search size={22} aria-hidden="true" />
          </button>
        </nav>
      </header>
      <div className="learning-route-header">
        <p>{route.title}</p>
        <span>
          {completed_count} of {route.steps.length} understood
        </span>
      </div>
      {is_detour && (
        <div className="learning-return">
          <button onClick={() => choose(progress.current_id)}>
            <ArrowLeft size={15} aria-hidden="true" />
            Back to your learning path
          </button>
          <button onClick={learn_from_here}>Learn from here</button>
        </div>
      )}
      <nav
        ref={tree_ref}
        className="learning-tree"
        aria-label="Local learning tree"
      >
        <svg className="learning-tree-links" aria-hidden="true">
          {connectors.map((path) => (
            <path key={path} d={path} />
          ))}
        </svg>
        {[
          ...tree.before.map((id, index) => ({
            id,
            position: `node-before-${index}`,
          })),
          { id: selected, position: 'node-current' },
          ...tree.after.map((id, index) => ({
            id,
            position: `node-after-${index}`,
          })),
          ...(tree.branch
            ? [{ id: tree.branch, position: 'node-branch' }]
            : []),
        ].map(({ id, position }) => (
          <LearningNode
            key={id}
            id={id}
            position={position}
            active={id === selected}
            understood={progress.completed.includes(id)}
            up_next={id === tree.after[0]}
            choose={choose}
          />
        ))}
      </nav>
      <MortgageLesson
        key={selected}
        concept={concept}
        formulas={formulas}
        is_detour={is_detour}
        completed={progress.completed.includes(selected)}
        complete={complete}
        browse={browse}
        choose={choose}
      />
      <p className="learning-announcement" aria-live="polite">
        {announcement}
      </p>
      {catalog_open && (
        <MortgageCatalog
          close={close_catalog}
          choose={choose}
          choose_route={choose_route}
          completed={progress.completed}
        />
      )}
    </section>
  );
}

function LearningNode({
  id,
  position,
  active,
  understood,
  up_next,
  choose,
}: {
  id: string;
  position: string;
  active: boolean;
  understood: boolean;
  up_next: boolean;
  choose: (id: string) => void;
}) {
  const item = learning_index.get(id)!;
  return (
    <button
      className={`learning-node ${position}${active ? ' is-current' : ''}${understood ? ' is-understood' : ''}`}
      aria-current={active ? 'step' : undefined}
      aria-label={`${item.title}${active ? ', current concept' : ''}${understood ? ', understood' : ''}`}
      data-concept-id={id}
      onClick={() => choose(id)}
    >
      {active && <span className="learning-node-label">You are here</span>}
      {up_next && <span className="learning-node-label">Up next</span>}
      {understood ? (
        <span className="learning-node-check">
          <Check size={17} aria-hidden="true" />
        </span>
      ) : (
        <Circle className="learning-node-circle" size={24} aria-hidden="true" />
      )}
      <span>
        <strong>{item.title}</strong>
        <small>{item.subtitle}</small>
      </span>
    </button>
  );
}
