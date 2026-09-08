'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import shows from '@/content/playbills.json';

export function PlaybillCollection() {
  const [selected_show, set_selected_show] = useState<number | null>(null);
  const collection = useRef<HTMLElement>(null);
  const select_show = (index: number) =>
    set_selected_show((current) => (current === index ? null : index));
  useEffect(() => {
    if (selected_show === null) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        !collection.current?.contains(target) ||
        !target.closest('button')
      )
        set_selected_show(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') set_selected_show(null);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [selected_show]);

  return (
    <section
      ref={collection}
      id="broadway"
      className="broadway-section playbill-collection"
      aria-labelledby="broadway-heading"
    >
      <div className="broadway-copy" data-reveal>
        <p className="eyebrow">05 / A LITTLE INTERMISSION</p>
        <h2 id="broadway-heading">
          A seat at
          <br />
          <em>the theatre.</em>
        </h2>
        <p>My current top five, from the Broadway shows I’ve seen.</p>
      </div>
      <div className="playbill-fan" data-open={selected_show !== null}>
        {shows.map((show, index) => (
          <Button
            key={show.slug}
            variant="ghost"
            className="playbill-card"
            style={{ '--card-offset': index - 2 } as CSSProperties}
            aria-pressed={selected_show === index}
            aria-label={`Select ${show.label}`}
            aria-controls="playbill-title"
            onClick={() => select_show(index)}
          >
            <Image
              unoptimized
              src={show.cover}
              alt={`${show.title} Playbill cover`}
              width={show.coverWidth}
              height={show.coverHeight}
              loading="lazy"
            />
          </Button>
        ))}
      </div>
      <p
        id="playbill-title"
        className="playbill-title"
        aria-live="polite"
        aria-atomic="true"
      >
        {selected_show === null
          ? 'Pick a Playbill.'
          : shows[selected_show].title}
      </p>
      <fieldset className="playbill-choices">
        <legend className="sr-only">Choose a Playbill</legend>
        {shows.map((show, index) => (
          <Button
            key={show.slug}
            variant="ghost"
            className="playbill-choice"
            aria-pressed={selected_show === index}
            aria-controls="playbill-title"
            onClick={() => select_show(index)}
          >
            {show.label}
          </Button>
        ))}
      </fieldset>
    </section>
  );
}
