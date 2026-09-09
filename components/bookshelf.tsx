'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { GripHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import books from '@/content/books.json';

type DragState = {
  slug: string;
  pointer_id: number;
  start_x: number;
  start_y: number;
  x: number;
  y: number;
  active: boolean;
  original: string[];
  targets: { x: number; y: number; rect: DOMRect }[];
};

export function Bookshelf() {
  const [order, set_order] = useState(() => books.map((book) => book.slug));
  const [selected_slug, set_selected_slug] = useState<string | null>(null);
  const [is_open, set_is_open] = useState(false);
  const [loaded_covers, set_loaded_covers] = useState<Record<string, boolean>>(
    {},
  );
  const [announcement, set_announcement] = useState('');
  const [drag_view, set_drag_view] = useState<DragState | null>(null);
  const drag = useRef<DragState | null>(null);
  const shelf = useRef<HTMLDivElement | null>(null);
  const slots = useRef(new Map<string, HTMLDivElement>());
  const previous_rects = useRef(new Map<string, DOMRect>());
  const animations = useRef(new Map<string, Animation>());
  const return_focus = useRef<HTMLButtonElement | null>(null);
  const selected_book = books.find((book) => book.slug === selected_slug);
  const selected_index = selected_slug ? order.indexOf(selected_slug) : -1;

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

  function start_drag(event: PointerEvent<HTMLButtonElement>, slug: string) {
    if (event.button !== 0 || !event.isPrimary) return;
    const targets = order.map((key) => {
      const rect = slots.current.get(key)!.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, rect };
    });
    drag.current = {
      slug,
      pointer_id: event.pointerId,
      start_x: event.clientX,
      start_y: event.clientY,
      x: event.clientX,
      y: event.clientY,
      active: false,
      original: [...order],
      targets,
    };
    set_selected_slug(slug);
    shelf.current?.setPointerCapture(event.pointerId);
  }

  function move_drag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointer_id !== event.pointerId) return;
    if (
      !current.active &&
      Math.hypot(
        event.clientX - current.start_x,
        event.clientY - current.start_y,
      ) < 8
    )
      return;
    current.active = true;
    current.x = event.clientX;
    current.y = event.clientY;
    set_drag_view({ ...current });
    let closest = -1;
    let distance = Infinity;
    current.targets.forEach((target, index) => {
      const next_distance = Math.hypot(
        event.clientX - target.x,
        event.clientY - target.y,
      );
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
    set_drag_view(null);
    if (cancelled && current?.active) {
      change_order(current.original);
      set_announcement('Move cancelled. Original order restored.');
    }
  }

  return (
    <>
      <p className="shelf-instructions" id="shelf-instructions">
        Open a cover. Drag a handle to rearrange.
      </p>
      <div
        className="bookshelf"
        ref={shelf}
        aria-label="Ten books on my bookshelf"
        onPointerMove={move_drag}
        onPointerUp={() => finish_drag()}
        onPointerCancel={() => finish_drag(true)}
        onLostPointerCapture={() => {
          if (drag.current) finish_drag(true);
        }}
      >
        {order.map((slug) => {
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
                  onClick={(event) => {
                    return_focus.current = event.currentTarget;
                    set_selected_slug(slug);
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
              <button
                type="button"
                className="book-drag-handle"
                aria-label={`Move ${book.title}`}
                aria-describedby="shelf-instructions"
                onClick={() => set_selected_slug(slug)}
                onPointerDown={(event) => start_drag(event, slug)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    finish_drag(true);
                    return;
                  }
                  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    set_selected_slug(slug);
                    move_book(
                      slug,
                      order.indexOf(slug) +
                        (event.key === 'ArrowLeft' ? -1 : 1),
                    );
                  }
                }}
              >
                <GripHorizontal size={18} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="book-details">
        <div className="book-detail-copy">
          <p className="eyebrow">
            {selected_book ? 'OFF THE SHELF' : 'ON THE SHELF'}
          </p>
          <h3>{selected_book?.title ?? 'Pick a book.'}</h3>
          {selected_book && (
            <p className="book-author">{selected_book.author}</p>
          )}
        </div>
        {selected_book && (
          <div
            className="book-move-controls"
            aria-label={`Rearrange ${selected_book.title}`}
          >
            <Button
              variant="outline"
              disabled={selected_index === 0}
              onClick={() => move_book(selected_book.slug, selected_index - 1)}
            >
              <ArrowLeft aria-hidden="true" /> Move left
            </Button>
            <Button
              variant="outline"
              disabled={selected_index === order.length - 1}
              onClick={() => move_book(selected_book.slug, selected_index + 1)}
            >
              Move right <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      <output className="sr-only" aria-live="polite">
        {announcement}
      </output>
      <Dialog open={is_open} onOpenChange={set_is_open}>
        <DialogContent className="open-book-dialog" finalFocus={return_focus}>
          {selected_book && (
            <>
              <div className="open-book-stage">
                <div className="open-book-paper">
                  <p className="eyebrow">IN THE MARGINS</p>
                  <DialogTitle>{selected_book.title}</DialogTitle>
                  <DialogDescription>{selected_book.author}</DialogDescription>
                  <p className="open-book-note">{selected_book.note}</p>
                </div>
                <DialogClose
                  className="open-book-cover"
                  aria-label="Close book"
                >
                  <Image
                    unoptimized
                    src={selected_book.cover}
                    width={selected_book.coverWidth}
                    height={selected_book.coverHeight}
                    alt=""
                    draggable={false}
                  />
                </DialogClose>
              </div>
              <DialogClose className="book-return">Return to shelf</DialogClose>
            </>
          )}
        </DialogContent>
      </Dialog>
      {drag_view &&
        createPortal(
          <div
            className="book-drag-ghost"
            style={{ left: drag_view.x, top: drag_view.y }}
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
