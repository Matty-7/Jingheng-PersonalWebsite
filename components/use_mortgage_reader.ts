import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { concept_index } from '@/lib/mortgage_graph';
import { concept_hash, read_concept_hash } from '@/lib/mortgage_reading';
import type { MortgageAction, MortgageState } from '@/lib/mortgage_state';

// URL hydration and reader focus are independent of camera/expanded layout changes.
export function useMortgageReader({
  selected,
  reader_open,
  reader_section,
  expanded,
  set_expanded,
  dispatch,
  canvas_ref,
  search_ref,
}: {
  selected: string | null;
  reader_open: boolean;
  reader_section: MortgageState['reader_section'];
  expanded: boolean;
  set_expanded: Dispatch<SetStateAction<boolean>>;
  dispatch: Dispatch<MortgageAction>;
  canvas_ref: RefObject<HTMLDivElement | null>;
  search_ref: RefObject<HTMLInputElement | null>;
}) {
  const [location_ready, set_location_ready] = useState(false);
  const [link_status, set_link_status] = useState('');
  const reader_ref = useRef<HTMLElement>(null);
  const return_focus = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const restore_location = () => {
      const id = read_concept_hash(
        window.location.hash,
        new Set(concept_index.keys()),
      );
      if (id) {
        dispatch({ type: 'restore_concept', id });
      }
    };
    const frame = window.requestAnimationFrame(() => {
      restore_location();
      set_location_ready(true);
    });
    window.addEventListener('hashchange', restore_location);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', restore_location);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!location_ready) return;
    const url = new URL(window.location.href);
    url.hash = selected ? concept_hash(selected) : '';
    window.history.replaceState(window.history.state, '', url);
  }, [selected, location_ready]);

  useEffect(() => {
    if (!reader_open || !selected) return;
    const reader = reader_ref.current;
    if (!reader) return;
    const target = reader.querySelector<HTMLElement>(
      reader_section === 'connections' ? '#concept-connections' : 'h2',
    );
    target?.focus({ preventScroll: true });
    if (target) {
      const rect = target.getBoundingClientRect();
      // Expansion owns focus on exit; its layout is not a reader focus request.
      const top_inset = reader.closest('[aria-modal="true"]') ? 156 : 88;
      if (rect.top < top_inset || rect.bottom > window.innerHeight - 24)
        target.scrollIntoView({ block: 'start' });
    }
  }, [reader_open, selected, reader_section]);

  const close_reader = useCallback(() => {
    dispatch({ type: 'close_reader' });
    const target = return_focus.current?.isConnected
      ? return_focus.current
      : (canvas_ref.current ?? search_ref.current);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest' });
  }, [dispatch, canvas_ref, search_ref]);
  useEffect(() => {
    if (!reader_open && !expanded) return;
    const on_escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        if (reader_open) close_reader();
        else set_expanded(false);
      }
    };
    window.addEventListener('keydown', on_escape);
    return () => window.removeEventListener('keydown', on_escape);
  }, [reader_open, expanded, close_reader, set_expanded]);

  async function copy_concept_link() {
    try {
      const url = new URL(window.location.href);
      url.hash = concept_hash(selected!);
      await navigator.clipboard.writeText(url.href);
      set_link_status('Link copied');
    } catch {
      set_link_status('Use the link in your address bar.');
    }
  }

  function remember_trigger(trigger?: HTMLButtonElement) {
    if (trigger) return_focus.current = trigger;
  }
  function clear_link_status() {
    set_link_status('');
  }
  return {
    reader_ref,
    link_status,
    close_reader,
    copy_concept_link,
    remember_trigger,
    clear_link_status,
  };
}
