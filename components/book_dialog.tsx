'use client';

import Image from 'next/image';
import type { RefObject } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type books from '@/content/books.json';

export function BookDialog({
  book,
  open,
  on_open_change,
  return_focus,
}: {
  book: (typeof books)[number];
  open: boolean;
  on_open_change: (open: boolean) => void;
  return_focus: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Dialog open={open} onOpenChange={on_open_change}>
      <DialogContent className="open-book-dialog" finalFocus={return_focus}>
        <div className="open-book-stage">
          <div className="open-book-paper">
            <DialogTitle className="sr-only">{book.title}</DialogTitle>
            <DialogDescription className="sr-only">
              {book.author}
            </DialogDescription>
            <blockquote className="open-book-quote" cite={book.quote_source}>
              “{book.quote}”
            </blockquote>
          </div>
          <div className="open-book-cover" aria-hidden="true">
            <Image
              unoptimized
              src={book.cover}
              width={book.coverWidth}
              height={book.coverHeight}
              alt=""
              draggable={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
