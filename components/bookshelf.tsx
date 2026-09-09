'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import {
  useLayoutEffect,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import books from '@/content/books.json';
import { bind_book_touch, type BookTouchEvent } from '@/lib/book_touch';

type DragState = {
  slug: string;
  pointer_id: number;
  start_x: number;
  start_y: number;
  x: number;
  y: number;
  active: boolean;
  pointer_type: string;
  original: string[];
  targets: { x: number; y: number; rect: DOMRect }[];
};

export function Bookshelf() {
  const [order, set_order] = useState(() => books.map((book) => book.slug));
  const [selected_slug, set_selected_slug] = useState<string | null>(null);
  const [is_open, set_is_open] = useState(false);
  const [dialog_slug, set_dialog_slug] = useState<string | null>(null);
  const suppress_click = useRef(false);
  const [loaded_covers, set_loaded_covers] = useState<Record<string, boolean>>(
    {},
  );
  const [announcement, set_announcement] = useState('');
  const [drag_view, set_drag_view] = useState<DragState | null>(null);
  const drag = useRef<DragState | null>(null);
  const drag_ghost = useRef<HTMLDivElement | null>(null);
  const drag_frame = useRef<number | null>(null);
  const shelf = useRef<HTMLDivElement | null>(null);
  const slots = useRef(new Map<string, HTMLDivElement>());
  const previous_rects = useRef(new Map<string, DOMRect>());
  const animations = useRef(new Map<string, Animation>());
  const return_focus = useRef<HTMLButtonElement | null>(null);
  const dialog_book = books.find((book) => book.slug === dialog_slug);

  useEffect(() => {
    function dismiss_selection(event: globalThis.PointerEvent) {
      const target = event.target;
      if (target instanceof Element && !target.closest('.bookshelf-book')) {
        set_selected_slug(null);
      }
    }
    function clear_pending_pointer() {
      if (drag.current?.pointer_type !== 'touch' && !drag.current?.active)
        drag.current = null;
    }
    document.addEventListener('pointerdown', dismiss_selection);
    document.addEventListener('pointerup', clear_pending_pointer);
    return () => {
      document.removeEventListener('pointerdown', dismiss_selection);
      document.removeEventListener('pointerup', clear_pending_pointer);
    };
  }, []);

  useLayoutEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    for (const [slug, element] of slots.current) {
      const before = previous_rects.current.get(slug);
      animations.current.get(slug)?.cancel();
      const after = element.getBoundingClientRect();
      if (before && !reduced) {
        animations.current.set(
          slug,
          element.animate(
            [
              {
                transform: `translate(${before.x - after.x}px, ${before.y - after.y}px)`,
              },
              { transform: 'translate(0, 0)' },
            ],
            { duration: 300, easing: 'cubic-bezier(.2,.75,.2,1)' },
          ),
        );
      }
    }
    previous_rects.current.clear();
  }, [order]);

  function change_order(next: string[]) {
    previous_rects.current = new Map(
      [...slots.current].map(([slug, element]) => [
        slug,
        element.getBoundingClientRect(),
      ]),
    );
    set_order(next);
  }

  function move_book(slug: string, target: number) {
    const from = order.indexOf(slug);
    if (from === target || target < 0 || target >= order.length) return;
    const next = [...order];
    next.splice(from, 1);
    next.splice(target, 0, slug);
    change_order(next);
    set_announcement(
      `${books.find((book) => book.slug === slug)?.title}, position ${target + 1} of ${order.length}.`,
    );
  }

  function prepare_drag(
    slug: string,
    pointer_id: number,
    pointer_type: string,
    x: number,
    y: number,
  ) {
    suppress_click.current = false;
    const targets = order.map((key) => {
      const rect = slots.current.get(key)!.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, rect };
    });
    drag.current = {
      slug,
      pointer_id,
      start_x: x,
      start_y: y,
      x,
      y,
      active: false,
      pointer_type,
      original: [...order],
      targets,
    };
  }

  function start_drag(event: PointerEvent<HTMLButtonElement>, slug: string) {
    if (event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary)
      return;
    prepare_drag(
      slug,
      event.pointerId,
      event.pointerType,
      event.clientX,
      event.clientY,
    );
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function activate_drag(current: DragState) {
    current.active = true;
    suppress_click.current = true;
    set_selected_slug(current.slug);
    set_drag_view({ ...current });
  }

  function move_drag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (
      event.pointerType === 'touch' ||
      !current ||
      current.pointer_id !== event.pointerId
    )
      return;
    const dx = event.clientX - current.start_x;
    const dy = event.clientY - current.start_y;
    if (!current.active) {
      if (Math.hypot(dx, dy) < 8) return;
      activate_drag(current);
      shelf.current?.setPointerCapture(event.pointerId);
    }
    update_drag(current, event.clientX, event.clientY);
  }

  function update_drag(current: DragState, x: number, y: number) {
    current.x = x;
    current.y = y;
    if (drag_frame.current === null) {
      drag_frame.current = requestAnimationFrame(() => {
        drag_frame.current = null;
        if (drag.current !== current) return;
        drag_ghost.current?.style.setProperty('--drag-x', `${current.x}px`);
        drag_ghost.current?.style.setProperty('--drag-y', `${current.y}px`);
      });
    }
    let closest = -1;
    let distance = Infinity;
    current.targets.forEach((target, index) => {
      const next_distance = Math.hypot(x - target.x, y - target.y);
      if (next_distance < distance) {
        distance = next_distance;
        closest = index;
      }
    });
    const target = current.targets[closest];
    if (target && distance < Math.max(target.rect.width, target.rect.height))
      move_book(current.slug, closest);
  }

  function finish_drag(cancelled = false) {
    const current = drag.current;
    drag.current = null;
    if (drag_frame.current !== null) cancelAnimationFrame(drag_frame.current);
    drag_frame.current = null;
    set_drag_view(null);
    if (cancelled && current) {
      suppress_click.current = true;
      set_selected_slug(null);
    }
    if (cancelled && current?.active) {
      change_order(current.original);
      set_announcement('Move cancelled. Original order restored.');
    }
  }

  const handle_touch = useEffectEvent((event: BookTouchEvent) => {
    if (event.type === 'start') {
      prepare_drag(event.slug, event.id, 'touch', event.x, event.y);
    } else if (event.type === 'activate' && drag.current) {
      activate_drag(drag.current);
    } else if (event.type === 'move' && drag.current) {
      update_drag(drag.current, event.x, event.y);
    } else if (event.type === 'finish') {
      finish_drag(event.cancelled);
    }
  });

  useEffect(() => {
    const unbind = bind_book_touch(shelf.current!, (event) =>
      handle_touch(event),
    );
    return () => {
      unbind();
      if (drag_frame.current !== null) cancelAnimationFrame(drag_frame.current);
    };
  }, []);

  return (
    <>
      <p className="sr-only" id="book-keyboard-help">
        Use left and right arrow keys to move a book. Press Enter to open;
        Escape to close.
      </p>
      <div
        className="bookshelf"
        ref={shelf}
        aria-label="Ten books on my bookshelf"
        onPointerMove={move_drag}
        onPointerUp={(event) => {
          if (event.pointerType !== 'touch') finish_drag();
        }}
        onPointerCancel={(event) => {
          if (event.pointerType !== 'touch') finish_drag(true);
        }}
        onLostPointerCapture={(event) => {
          if (
            event.pointerType !== 'touch' &&
            event.target === shelf.current &&
            drag.current
          )
            finish_drag(true);
        }}
      >
        {(drag_view?.pointer_type === 'touch' ? drag_view.original : order).map(
          (slug) => {
            const book = books.find((item) => item.slug === slug)!;
            const original_index = books.indexOf(book);
            return (
              <div
                className={`shelf-slot ${drag_view?.slug === slug ? 'is-dragging' : ''}`}
                key={slug}
                ref={(element) => {
                  if (element) slots.current.set(slug, element);
                  else slots.current.delete(slug);
                }}
                style={
                  {
                    order: order.indexOf(slug),
                    '--book-ratio': book.coverWidth / book.coverHeight,
                    '--book-depth': `${32 + (original_index % 3) * 3}px`,
                  } as CSSProperties
                }
              >
                <div
                  className="book-reveal"
                  style={
                    {
                      '--book-cover': loaded_covers[slug]
                        ? `url("${book.cover}")`
                        : 'none',
                    } as CSSProperties
                  }
                >
                  <Button
                    variant="ghost"
                    className={`bookshelf-book ${selected_slug === slug ? 'chosen' : ''}`}
                    aria-label={`Open ${book.title} by ${book.author}`}
                    aria-haspopup="dialog"
                    aria-describedby="book-keyboard-help"
                    data-book-slug={slug}
                    onContextMenu={(event) => {
                      if (drag.current?.pointer_type === 'touch')
                        event.preventDefault();
                    }}
                    onPointerDown={(event) => start_drag(event, slug)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        finish_drag(true);
                        set_selected_slug(null);
                      }
                      if (
                        event.key === 'ArrowLeft' ||
                        event.key === 'ArrowRight'
                      ) {
                        event.preventDefault();
                        set_selected_slug(slug);
                        move_book(
                          slug,
                          order.indexOf(slug) +
                            (event.key === 'ArrowLeft' ? -1 : 1),
                        );
                      }
                    }}
                    onClick={(event) => {
                      if (suppress_click.current && event.detail !== 0) {
                        suppress_click.current = false;
                        return;
                      }
                      return_focus.current = event.currentTarget;
                      set_selected_slug(slug);
                      set_dialog_slug(slug);
                      set_is_open(true);
                    }}
                  >
                    <span className="book-volume">
                      <span className="book-back" aria-hidden="true" />
                      <span className="book-spine" aria-hidden="true" />
                      <span className="book-pages" aria-hidden="true" />
                      <span className="book-top" aria-hidden="true" />
                      <span className="book-front">
                        <Image
                          unoptimized
                          src={book.cover}
                          width={book.coverWidth}
                          height={book.coverHeight}
                          alt={`${book.title} book cover`}
                          loading="lazy"
                          draggable={false}
                          onLoad={() =>
                            set_loaded_covers((current) =>
                              current[slug]
                                ? current
                                : { ...current, [slug]: true },
                            )
                          }
                        />
                      </span>
                    </span>
                  </Button>
                </div>
              </div>
            );
          },
        )}
      </div>
      <output className="sr-only" aria-live="polite">
        {announcement}
      </output>
      <Dialog
        open={is_open}
        onOpenChange={(open) => {
          set_is_open(open);
          if (!open) set_selected_slug(null);
        }}
      >
        <DialogContent className="open-book-dialog" finalFocus={return_focus}>
          {dialog_book && (
            <>
              <div className="open-book-stage">
                <div className="open-book-paper">
                  <DialogTitle className="sr-only">
                    {dialog_book.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {dialog_book.author}
                  </DialogDescription>
                  <blockquote
                    className="open-book-quote"
                    cite={dialog_book.quote_source}
                  >
                    “{dialog_book.quote}”
                  </blockquote>
                </div>
                <div className="open-book-cover" aria-hidden="true">
                  <Image
                    unoptimized
                    src={dialog_book.cover}
                    width={dialog_book.coverWidth}
                    height={dialog_book.coverHeight}
                    alt=""
                    draggable={false}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {drag_view &&
        createPortal(
          <div
            className="book-drag-ghost"
            ref={drag_ghost}
            style={
              {
                '--drag-x': `${drag_view.x}px`,
                '--drag-y': `${drag_view.y}px`,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <Image
              unoptimized
              src={books.find((book) => book.slug === drag_view.slug)!.cover}
              width={150}
              height={220}
              alt=""
            />
          </div>,
          document.body,
        )}
    </>
  );
}
