'use client';

import Image from 'next/image';
import { useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import shows from '@/content/playbills.json';

export function PlaybillCollection() {
  const [selected_show, set_selected_show] = useState(0);

  return (
    <section
      id="broadway"
      className="broadway-section playbill-collection"
      aria-labelledby="broadway-heading"
    >
      <div className="broadway-copy" data-reveal>
        <p className="eyebrow">07 / A LITTLE INTERMISSION</p>
        <h2 id="broadway-heading">
          A seat at
          <br />
          <em>the theatre.</em>
        </h2>
        <p>My current top five, from the Broadway shows I’ve seen.</p>
      </div>
      <div className="playbill-fan">
        {shows.map((show, index) => (
          <Button
            key={show.slug}
            variant="ghost"
            className="playbill-card"
            style={{ '--card-offset': index - 2 } as CSSProperties}
            aria-pressed={selected_show === index}
            aria-label={`Select ${show.label}`}
            aria-controls="playbill-title"
            onClick={() => set_selected_show(index)}
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
        {shows[selected_show].title}
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
            onClick={() => set_selected_show(index)}
          >
            {show.label}
          </Button>
        ))}
      </fieldset>
    </section>
  );
}
