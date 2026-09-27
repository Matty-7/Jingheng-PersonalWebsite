'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, Circle, Search } from 'lucide-react';
import {
  initial_progress,
  learning_index,
  local_tree,
  next_lesson,
  progress_key,
  position_cookie,
  route_for_concept,
  route_index,
  select_lesson,
  type LearningProgress,
} from '@/lib/mortgage_learning';
import { MortgageCatalog } from './mortgage_catalog';
import { MortgageLesson } from './mortgage_lesson';
import type { MortgageFormulas } from './mortgage_reader';
import { useLearningProgress } from './use_learning_progress';

export function MortgageMap({
  formulas,
  home_link,
  initial_lesson = initial_progress,
}: {
  formulas: MortgageFormulas;
  home_link: ReactNode;
  initial_lesson?: LearningProgress;
}) {
  const { progress, loaded, set_progress } =
    useLearningProgress(initial_lesson);
  const selected = progress.current_id;
  const [catalog_open, set_catalog_open] = useState(false);
  const [announcement, set_announcement] = useState('');
  const catalog_trigger = useRef<HTMLElement | null>(null);
  const map_ref = useRef<HTMLElement>(null);
  const tree_ref = useRef<HTMLElement>(null);
  const focus_requested = useRef(false);
  const [connectors, set_connectors] = useState<string[]>([]);
  const concept = learning_index.get(selected)!;
  const route = route_for_concept(selected, progress.route_id);
  const tree = local_tree(route, selected);
  const completed_count = route.steps.filter((id) =>
    progress.completed.includes(id),
  ).length;

  useLayoutEffect(() => {
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
    measure_connections();
    const observer = new ResizeObserver(measure_connections);
    observer.observe(tree_element);
    return () => {
      observer.disconnect();
    };
  }, [selected, route.id]);

  useEffect(() => {
    if (!loaded) return;
    if (location.pathname !== '/portfolio/mortgage-map') return;
    document.documentElement.removeAttribute('data-mortgage-pending');
    try {
      localStorage.setItem(progress_key, JSON.stringify(progress));
    } catch {
      /* Progress remains available for this visit. */
    }
    try {
      const position = encodeURIComponent(
        JSON.stringify({
          route_id: progress.route_id,
          current_id: progress.current_id,
        }),
      );
      save_position_cookie(position);
    } catch {
      /* The URL still preserves this lesson when cookies are unavailable. */
    }
  }, [loaded, progress]);

  useEffect(() => {
    const close_on_history = () => set_catalog_open(false);
    window.addEventListener('popstate', close_on_history);
    window.addEventListener('hashchange', close_on_history);
    return () => {
      window.removeEventListener('popstate', close_on_history);
      window.removeEventListener('hashchange', close_on_history);
    };
  }, []);

  useLayoutEffect(() => {
    if (!focus_requested.current) return;
    focus_requested.current = false;
    map_ref.current
      ?.querySelector<HTMLElement>('#learning-title')
      ?.focus({ preventScroll: true });
  }, [selected, catalog_open]);
  function choose(id: string, preferred = progress.route_id) {
    if (!learning_index.has(id)) return;
    const chosen_route = route_for_concept(id, preferred);
    // Stamp the current entry only when navigating. Rewriting the URL during
    // hydration can cancel an in-flight document navigation in WebKit.
    const current_url = new URL(location.href);
    current_url.hash = `concept=${progress.current_id}`;
    current_url.searchParams.set('concept', progress.current_id);
    // The framework preserves its own metadata for native History API calls.
    // Copying that metadata back would mislabel this as a router navigation.
    history.replaceState(
      { learning_route: progress.route_id },
      '',
      current_url,
    );
    focus_requested.current = true;
    set_progress((current) => select_lesson(current, id, chosen_route.id));
    set_catalog_open(false);
    const url = new URL(location.href);
    url.hash = `concept=${id}`;
    url.searchParams.set('concept', id);
    const state = { learning_route: chosen_route.id };
    if (location.hash !== url.hash) history.pushState(state, '', url);
    else history.replaceState(state, '', url);
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
    choose(current_id, chosen.id);
  }
  function complete() {
    const completed = [...new Set([...progress.completed, selected])];
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
        concept={concept}
        formulas={formulas}
        completed={progress.completed.includes(selected)}
        complete={complete}
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

function save_position_cookie(position: string) {
  document.cookie = `${position_cookie}=${position}; Path=/portfolio/mortgage-map; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}
