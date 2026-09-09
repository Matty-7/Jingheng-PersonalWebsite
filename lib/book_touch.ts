export type BookTouchEvent =
  | { type: 'start'; slug: string; id: number; x: number; y: number }
  | { type: 'activate' }
  | { type: 'move'; x: number; y: number }
  | { type: 'finish'; cancelled: boolean };

export function bind_book_touch(
  shelf: HTMLElement,
  notify: (event: BookTouchEvent) => void,
) {
  const doc = shelf.ownerDocument;
  const view = doc.defaultView!;
  let gesture: { id: number; active: boolean } | null = null;
  let hold_timer: ReturnType<typeof setTimeout> | undefined;

  function finish(cancelled: boolean) {
    clearTimeout(hold_timer);
    if (!gesture) return;
    gesture = null;
    notify({ type: 'finish', cancelled });
  }

  function start(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    const target = event.target as Element;
    const cover = target.closest<HTMLElement>('[data-book-slug]');
    const slug = cover?.dataset.bookSlug;
    if (!slug || !shelf.contains(cover)) return;
    const touch = event.touches[0];
    finish(true);
    gesture = { id: touch.identifier, active: false };
    notify({
      type: 'start',
      slug,
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    });
    hold_timer = setTimeout(() => {
      if (!gesture) return;
      gesture.active = true;
      notify({ type: 'activate' });
    }, 180);
  }

  function move(event: TouchEvent) {
    if (!gesture) return;
    const touch = Array.from(event.touches).find(
      (item) => item.identifier === gesture?.id,
    );
    if (event.touches.length !== 1 || !touch || !event.cancelable) {
      finish(true);
      return;
    }
    // Once an uncancelled move starts native scrolling, never steal that gesture back.
    if (!gesture.active) {
      finish(true);
      return;
    }
    event.preventDefault();
    notify({ type: 'move', x: touch.clientX, y: touch.clientY });
  }

  function end(event: TouchEvent) {
    if (
      !gesture ||
      !Array.from(event.changedTouches).some(
        (touch) => touch.identifier === gesture?.id,
      )
    )
      return;
    if (gesture.active && event.cancelable) event.preventDefault();
    finish(false);
  }

  function cancel() {
    finish(true);
  }
  function check_multitouch(event: TouchEvent) {
    if (event.touches.length > 1) cancel();
  }

  shelf.addEventListener('touchstart', start, { passive: true });
  doc.addEventListener('touchstart', check_multitouch, { passive: true });
  doc.addEventListener('touchmove', move, { passive: false });
  doc.addEventListener('touchend', end, { passive: false });
  doc.addEventListener('touchcancel', cancel);
  view.addEventListener('blur', cancel);
  view.addEventListener('resize', cancel);
  doc.addEventListener('scroll', cancel, { capture: true, passive: true });
  return () => {
    clearTimeout(hold_timer);
    gesture = null;
    shelf.removeEventListener('touchstart', start);
    doc.removeEventListener('touchstart', check_multitouch);
    doc.removeEventListener('touchmove', move);
    doc.removeEventListener('touchend', end);
    doc.removeEventListener('touchcancel', cancel);
    view.removeEventListener('blur', cancel);
    view.removeEventListener('resize', cancel);
    doc.removeEventListener('scroll', cancel, true);
  };
}
