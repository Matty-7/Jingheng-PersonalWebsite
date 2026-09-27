'use client';

import Image from 'next/image';
import { memo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { AtlasDetail } from '@/lib/atlas_browser';

export function AtlasImage({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const [failed, set_failed] = useState(false);
  return failed ? (
    <span className="atlas-image-fallback">Image unavailable</span>
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      loading="lazy"
      onError={() => set_failed(true)}
    />
  );
}

function SourceLink({
  href,
  aria_label,
  children,
}: {
  href: string;
  aria_label?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={aria_label}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children} <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

export const AtlasStory = memo(function AtlasStory({
  detail,
}: {
  detail: AtlasDetail;
}) {
  const { entry, connection, sources } = detail;
  if (entry.medium === 'film') {
    const { scene } = entry;
    return (
      <div className="atlas-story">
        {scene.still && (
          <figure className="atlas-still">
            <AtlasImage
              key={scene.still.src}
              src={scene.still.src}
              alt={scene.still.alt}
              width={scene.still.width}
              height={scene.still.height}
            />
            <figcaption>
              {scene.still.credit} ·{' '}
              <SourceLink href={scene.still.source_url}>
                {scene.still.kind ? 'Image source' : 'Frame source'}
              </SourceLink>
            </figcaption>
          </figure>
        )}
        <p>{scene.scene}</p>
        <details className="atlas-notes">
          <summary>Scene sources</summary>
          <div className="atlas-sources">
            {scene.source_ids.map((id) => {
              const source = sources.find((item) => item.id === id);
              return source ? (
                <SourceLink key={id} href={source.url}>
                  {source.label}
                </SourceLink>
              ) : null;
            })}
          </div>
        </details>
      </div>
    );
  }
  if (entry.medium === 'literature') {
    const { passage, work } = entry;
    return (
      <div className="atlas-story">
        <p className="atlas-eyebrow">Original words · {passage.excerpt_kind}</p>
        <blockquote cite={passage.source_url}>{passage.excerpt}</blockquote>
        <p className="atlas-caption">{passage.locator}</p>
        <SourceLink href={passage.source_url}>Read the source</SourceLink>
        <p>{passage.note}</p>
        <details className="atlas-notes">
          <summary>Text &amp; cover notes</summary>
          <p>
            {work.rights}. {passage.excerpt_kind} transcribed from the linked
            source; original wording retained.
          </p>
          {work.cover && (
            <>
              <p>
                {work.cover.edition} · {work.cover.credit}
              </p>
              <SourceLink href={work.cover.source_url}>Cover source</SourceLink>
            </>
          )}
          {passage.place_source_url && (
            <SourceLink href={passage.place_source_url}>
              Location reference
            </SourceLink>
          )}
        </details>
      </div>
    );
  }
  const { track } = entry;
  return (
    <div className="atlas-story">
      {connection && (
        <div className="atlas-connection-note">
          <p>{connection.note}</p>
          <SourceLink href={connection.source_url}>
            {connection.source_label}
          </SourceLink>
        </div>
      )}
      <p className="atlas-eyebrow">
        {connection
          ? 'About the song'
          : track.excerpt
            ? 'In the lyrics'
            : 'In the title'}
      </p>
      {track.excerpt && (
        <blockquote cite={track.source_url}>“{track.excerpt}”</blockquote>
      )}
      <p>{track.note}</p>
      <SourceLink href={track.source_url}>{track.source_label}</SourceLink>
      {track.excerpt && (
        <p className="atlas-caption">
          Short excerpt. Full lyrics at the source.
        </p>
      )}
    </div>
  );
});
