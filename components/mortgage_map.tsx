'use client';

import {
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, Circle, Search } from 'lucide-react';
import {
  initial_progress,
  create_learning_model,
  position_cookie,
  question_version,
  type LearningProgress,
  type LearningNode as LearningNodeData,
  type LearningRoute,
} from '@/lib/mortgage_learning_state';
import { MortgageCatalog } from './mortgage_catalog';
import { MortgageLesson } from './mortgage_lesson';
import type { MortgageLessonData } from '@/lib/mortgage_lesson';
import { useLearningProgress } from './use_learning_progress';
import {
  tree_connections,
  useLearningTreeMotion,
} from './use_learning_tree_motion';

export function MortgageMap({
  initial_detail,
  navigation,
  routes,
  home_link,
  sign_in_link,
  sign_out_link,
  initial_lesson = initial_progress,
}: {
  initial_detail: MortgageLessonData;
  navigation: LearningNodeData[];
  routes: LearningRoute[];
  home_link: ReactNode;
  sign_in_link: ReactNode;
  sign_out_link: ReactNode;
  initial_lesson?: LearningProgress;
}) {
  const model = useMemo(
    () => create_learning_model(navigation, routes),
    [navigation, routes],
  );
  const {
    learning_index,
    local_tree,
    next_lesson,
    route_for_concept,
    route_index,
    select_lesson,
  } = model;
  const {
    progress,
    lesson,
    loaded,
    has_committed,
    pending_id,
    failed,
    set_progress,
    prefetch,
    retry,
    save_status,
    saved_at,
    signed_in,
    retry_save,
  } = useLearningProgress(initial_lesson, initial_detail, model);
  const selected = progress.current_id;
  const [catalog_open, set_catalog_open] = useState(false);
  const [announcement, set_announcement] = useState('');
  const catalog_trigger = useRef<HTMLElement | null>(null);
  const all_topics_trigger = useRef<HTMLButtonElement>(null);
  const map_ref = useRef<HTMLElement>(null);
  const tree_ref = useRef<HTMLElement>(null);
  const focus_requested = useRef(false);
  const concept = learning_index.get(selected)!;
  const route = route_for_concept(selected, progress.route_id);
  const tree = local_tree(route, selected);
  const completed_count = route.steps.filter((id) =>
    progress.completed.includes(id),
  ).length;

  useLearningTreeMotion(tree_ref, `${route.id}:${selected}`, loaded);

  useEffect(() => {
    if (!loaded) return;
    if (location.pathname !== '/portfolio/mortgage-map') return;
    if (!pending_id || failed)
      document.documentElement.removeAttribute('data-mortgage-pending');
  }, [loaded, pending_id, failed]);

  useEffect(() => {
    // Pending requests retain confirmed progress. Failed initial restoration
    // must not persist the server fallback over previously saved work.
    if (!has_committed || location.pathname !== '/portfolio/mortgage-map')
      return;
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
  }, [has_committed, progress]);

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
    if (!focus_requested.current || catalog_open || pending_id) return;
    focus_requested.current = false;
    map_ref.current
      ?.querySelector<HTMLElement>('#learning-title')
      ?.focus({ preventScroll: true });
  }, [selected, catalog_open, pending_id]);
  function choose(id: string, preferred = progress.route_id) {
    if (!learning_index.has(id)) return;
    const chosen_route = route_for_concept(id, preferred);
    set_progress(
      (current) => select_lesson(current, id, chosen_route.id),
      () => {
        const current_url = new URL(location.href);
        current_url.hash = `concept=${progress.current_id}`;
        current_url.searchParams.set('concept', progress.current_id);
        history.replaceState(
          { learning_route: progress.route_id },
          '',
          current_url,
        );
        focus_requested.current = true;
        set_catalog_open(false);
        const url = new URL(location.href);
        url.hash = `concept=${id}`;
        url.searchParams.set('concept', id);
        const state = { learning_route: chosen_route.id };
        if (location.hash !== url.hash) history.pushState(state, '', url);
        else history.replaceState(state, '', url);
      },
    );
  }

  function browse(invoker?: HTMLElement) {
    const active = document.activeElement;
    catalog_trigger.current =
      invoker?.isConnected === true
        ? invoker
        : active instanceof HTMLElement &&
            active !== document.body &&
            active !== document.documentElement &&
            active.isConnected
          ? active
          : all_topics_trigger.current;
    set_catalog_open(true);
  }
  function close_catalog() {
    const trigger = catalog_trigger.current;
    set_catalog_open(false);
    requestAnimationFrame(() => {
      const target = trigger?.isConnected
        ? trigger
        : all_topics_trigger.current;
      target?.focus({ preventScroll: true });
    });
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
    set_progress({ ...progress, completed });
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
          <button
            ref={all_topics_trigger}
            className="learning-text-button"
            onClick={(event) => browse(event.currentTarget)}
          >
            All topics <ChevronDown size={16} aria-hidden="true" />
          </button>
          <button
            className="learning-icon-button"
            onClick={(event) => browse(event.currentTarget)}
            aria-label="Search concepts"
          >
            <Search size={22} aria-hidden="true" />
          </button>
        </nav>
      </header>
      <div className="learning-save-bar" aria-label="Learning progress">
        <span aria-live="polite">
          {save_status === 'loading'
            ? 'Restoring your progress…'
            : save_status === 'saving'
              ? 'Saving progress…'
              : save_status === 'error'
                ? 'Progress has not synced.'
                : signed_in
                  ? 'Progress saved to your account'
                  : 'Progress saved for this browser'}
          {save_status === 'saved' && saved_at && (
            <time
              dateTime={new Date(saved_at).toISOString()}
              title={new Date(saved_at).toLocaleString()}
            >
              {' '}
              · {progress.completed.length} understood
            </time>
          )}
        </span>
        {save_status === 'error' && (
          <button className="learning-text-button" onClick={retry_save}>
            Retry save
          </button>
        )}
        {signed_in ? (
          sign_out_link
        ) : (
          <span className="learning-sync-signin">
            {sign_in_link}
            <small>Continue on another device</small>
          </span>
        )}
      </div>
      {(pending_id || failed) && (
        <output className="learning-load-status">
          {failed
            ? 'This lesson could not load.'
            : `Loading ${learning_index.get(pending_id!)?.title ?? 'lesson'}…`}
          {failed && (
            <button className="learning-text-button" onClick={retry}>
              Try again
            </button>
          )}
        </output>
      )}
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
          {tree_connections.map(([from, to]) => (
            <path key={`${from}-${to}`} data-connection={`${from}-${to}`} />
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
            item={learning_index.get(id)!}
            prefetch={prefetch}
            position={position}
            active={id === selected}
            understood={progress.completed.includes(id)}
            up_next={id === tree.after[0]}
            choose={choose}
          />
        ))}
      </nav>
      <MortgageLesson
        lesson={lesson}
        learning_index={learning_index}
        busy={pending_id !== null}
        completed={progress.completed.includes(selected)}
        complete={complete}
        choose={choose}
        saved_answer={progress.answers?.[selected]}
        answer={(choice) =>
          set_progress((current) => ({
            ...current,
            answers: {
              ...current.answers,
              [selected]: {
                choice,
                version: question_version(
                  lesson.concept.question,
                  lesson.check.choices,
                ),
              },
            },
          }))
        }
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
          first_route={routes[0]}
          pending_title={
            pending_id ? learning_index.get(pending_id)?.title : undefined
          }
          lesson_failed={failed}
          retry_lesson={retry}
        />
      )}
    </section>
  );
}

function LearningNode({
  id,
  item,
  prefetch,
  position,
  active,
  understood,
  up_next,
  choose,
}: {
  id: string;
  item: LearningNodeData;
  prefetch: (id: string) => void;
  position: string;
  active: boolean;
  understood: boolean;
  up_next: boolean;
  choose: (id: string) => void;
}) {
  return (
    <button
      className={`learning-node ${position}${active ? ' is-current' : ''}${understood ? ' is-understood' : ''}`}
      aria-current={active ? 'step' : undefined}
      aria-label={`${item.title}${active ? ', current concept' : ''}${understood ? ', understood' : ''}`}
      data-concept-id={id}
      onPointerEnter={() => prefetch(id)}
      onFocus={() => prefetch(id)}
      onTouchStart={() => prefetch(id)}
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
