'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export function useAlbumScroll(shelf: RefObject<HTMLDivElement | null>, collection_key: string) {
  const [enabled, set_enabled] = useState(true);
  const [reduced, set_reduced] = useState(false);
  const interaction = useRef<() => void>(() => {});
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => set_reduced(media.matches);
    queueMicrotask(update);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const element = shelf.current;
    if (!element || !enabled || reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let last_time = 0;
    let position = element.scrollLeft;
    let direction = 1;
    let hovering = element.matches(':hover');
    let hover_exempt = false;
    let keyboard_mode = true;
    let focused = element.contains(document.activeElement) && document.activeElement?.matches(':focus-visible');
    let manual = false;
    let resume_at = 0;
    const held_pointers = new Set<number>();
    const defer = () => {
      manual = true;
      hover_exempt = true;
      resume_at = performance.now() + 2000;
      position = element.scrollLeft;
    };
    interaction.current = defer;
    const step = (time: number) => {
      const maximum = Math.max(0, element.scrollWidth - element.clientWidth);
      if (manual && !held_pointers.size && time >= resume_at) manual = false;
      if (last_time && !manual && !held_pointers.size && !(hovering && !hover_exempt) && !focused && !document.hidden && maximum > 0) {
        position = Math.max(0, Math.min(maximum, position + direction * Math.min(time - last_time, 50) * .036));
        element.scrollLeft = position;
        if (position >= maximum) direction = -1;
        if (position <= 0) direction = 1;
      } else position = element.scrollLeft;
      last_time = time;
      frame = requestAnimationFrame(step);
    };
    const enter = (event: PointerEvent) => { if (event.pointerType === 'mouse') { hovering = true; hover_exempt = false; } };
    const leave = () => { hovering = false; hover_exempt = false; position = element.scrollLeft; };
    const pointer_input = () => { keyboard_mode = false; focused = false; };
    const pointer_down = (event: PointerEvent) => { held_pointers.add(event.pointerId); defer(); };
    const pointer_end = (event: PointerEvent) => { if (held_pointers.delete(event.pointerId)) defer(); };
    const key_input = (event: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;
      keyboard_mode = true;
      focused = element.contains(document.activeElement);
    };
    const focus_in = () => { focused = keyboard_mode; };
    const focus_out = (event: FocusEvent) => { focused = keyboard_mode && event.relatedTarget instanceof Node && element.contains(event.relatedTarget); position = element.scrollLeft; };
    // Only manual sessions extend the idle deadline; our own scroll events must not.
    const scroll = () => { if (manual) defer(); };
    const visibility = () => { last_time = 0; };
    const release = () => { if (held_pointers.size) { held_pointers.clear(); defer(); } };
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('pointerdown', pointer_down);
    element.addEventListener('wheel', defer, { passive: true });
    element.addEventListener('scroll', scroll, { passive: true });
    element.addEventListener('focusin', focus_in);
    element.addEventListener('focusout', focus_out);
    document.addEventListener('pointerdown', pointer_input, true);
    document.addEventListener('pointerup', pointer_end);
    document.addEventListener('pointercancel', pointer_end);
    document.addEventListener('keydown', key_input, true);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', release);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      interaction.current = () => {};
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('pointerdown', pointer_down);
      element.removeEventListener('wheel', defer);
      element.removeEventListener('scroll', scroll);
      element.removeEventListener('focusin', focus_in);
      element.removeEventListener('focusout', focus_out);
      document.removeEventListener('pointerdown', pointer_input, true);
      document.removeEventListener('pointerup', pointer_end);
      document.removeEventListener('pointercancel', pointer_end);
      document.removeEventListener('keydown', key_input, true);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', release);
    };
  }, [shelf, enabled, reduced, collection_key]);
  return { scrolling: enabled && !reduced, reduced, defer: () => interaction.current(), toggle: () => set_enabled((value) => !value) };
}
