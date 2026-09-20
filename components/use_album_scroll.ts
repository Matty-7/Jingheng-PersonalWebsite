'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useAlbumScroll(shelf: RefObject<HTMLDivElement | null>, collection_key: string) {
  const [enabled, set_enabled] = useState(true);
  const [reduced, set_reduced] = useState(false);
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
    let focused = element.contains(document.activeElement);
    const step = (time: number) => {
      const maximum = Math.max(0, element.scrollWidth - element.clientWidth);
      if (last_time && !hovering && !focused && !document.hidden && maximum > 0) {
        position = Math.max(0, Math.min(maximum, position + direction * Math.min(time - last_time, 50) * .012));
        element.scrollLeft = position;
        if (position >= maximum) direction = -1;
        if (position <= 0) direction = 1;
      } else position = element.scrollLeft;
      last_time = time;
      frame = requestAnimationFrame(step);
    };
    const enter = (event: PointerEvent) => { if (event.pointerType === 'mouse') hovering = true; };
    const leave = () => { hovering = false; position = element.scrollLeft; };
    const focus_in = () => { focused = true; };
    const focus_out = (event: FocusEvent) => { focused = event.relatedTarget instanceof Node && element.contains(event.relatedTarget); position = element.scrollLeft; };
    const stop = () => set_enabled(false);
    const visibility = () => { last_time = 0; };
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('focusin', focus_in);
    element.addEventListener('focusout', focus_out);
    element.addEventListener('pointerdown', stop);
    element.addEventListener('wheel', stop, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('focusin', focus_in);
      element.removeEventListener('focusout', focus_out);
      element.removeEventListener('pointerdown', stop);
      element.removeEventListener('wheel', stop);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [shelf, enabled, reduced, collection_key]);
  return { scrolling: enabled && !reduced, reduced, pause: () => set_enabled(false), toggle: () => set_enabled((value) => !value) };
}
