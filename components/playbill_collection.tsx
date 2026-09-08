'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import shows from '@/content/playbills.json';
import recording from '@/content/broadway.json';

export function PlaybillCollection() {
  const [selected_show, set_selected_show] = useState(0);
  const show = shows[selected_show];

  return (
    <section
      id="broadway"
      className="broadway-section playbill-collection"
      data-parallax
    >
      <div className="broadway-copy playbill-picker" data-reveal>
        <p className="eyebrow">07 / A LITTLE INTERMISSION</p>
        <h2>
          New York,
          <br />
          <em>on a high note.</em>
        </h2>
        <p>There’s always room for Broadway.</p>
        <fieldset className="playbill-choices">
          <legend className="sr-only">Choose a Playbill</legend>
          {shows.map((item, index) => (
            <Button
              key={item.slug}
              variant="ghost"
              className="playbill-choice"
              aria-pressed={selected_show === index}
              aria-controls="playbill-details"
              onClick={() => set_selected_show(index)}
            >
              <span className="playbill-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{item.label}</span>
              <span className="playbill-selection-mark" aria-hidden="true">
                ↗
              </span>
            </Button>
          ))}
        </fieldset>
      </div>
      <div id="playbill-details" className="playbill-details">
        <div className="cast-sleeve playbill-sleeve" data-reveal>
          <div key={show.slug} className="playbill-paper">
            <Image
              unoptimized
              src={show.cover}
              alt={`${show.title} Playbill cover`}
              width={show.coverWidth}
              height={show.coverHeight}
              loading="lazy"
            />
          </div>
        </div>
        <div className="playbill-caption" aria-live="polite" aria-atomic="true">
          <h3>{show.title}</h3>
          <a
            className="text-link"
            href={show.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            View this Playbill <ArrowUpRight size={17} />
          </a>
          {show.slug === 'two-strangers' && (
            <div className="playbill-recording">
              <p>
                “{recording.trackName}”<br />
                {recording.displayArtist}
                <br />
                Original London Cast Recording
              </p>
              <a
                className="text-link"
                href={recording.appleMusicUrl}
                target="_blank"
                rel="noreferrer"
              >
                Listen on Apple Music <ArrowUpRight size={17} />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
