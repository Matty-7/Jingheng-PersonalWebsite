'use client';

import Image from 'next/image';
import { memo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { AtlasDetail } from '@/lib/atlas_browser';
import { atlas_story_sources } from '@/lib/atlas_sources';
import { AtlasMusicLinks } from './atlas_music_links';

export function AtlasImage({
  src,
  alt,
  width,
  height,
  class_name,
  eager = false,
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  class_name: string;
  eager?: boolean;
  children?: React.ReactNode;
}) {
  const [failed_src, set_failed_src] = useState<string | null>(null);
  if (failed_src === src) return null;
  return (
    <figure className={class_name}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => set_failed_src(src)}
      />
      {children}
    </figure>
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
  const { entry, connection } = detail;
  const sources = atlas_story_sources(detail);
  const source_link = (kind: (typeof sources)[number]['kind']) => {
    const source = sources.find((item) => item.kind === kind);
    return source ? (
      <SourceLink href={source.url}>{source.label}</SourceLink>
    ) : null;
  };
  if (entry.medium === 'film') {
    const { scene } = entry;
    const scene_sources = sources.filter((source) => source.kind === 'scene');
    return (
      <div className="atlas-story">
        {scene.still && (
          <>
            <AtlasImage
              key={scene.still.src}
              src={scene.still.src}
              alt={scene.still.alt}
              width={scene.still.width}
              height={scene.still.height}
              class_name="atlas-still"
            />
            <p className="atlas-caption">
              {scene.still.credit} · {source_link('image')}
            </p>
          </>
        )}
        <p>{scene.scene}</p>
        {scene_sources.length > 0 && (
          <details className="atlas-notes">
            <summary>Scene sources</summary>
            <div className="atlas-sources">
              {scene_sources.map((source) => (
                <SourceLink key={source.url} href={source.url}>
                  {source.label}
                </SourceLink>
              ))}
            </div>
          </details>
        )}
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
        {source_link('text')}
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
              {source_link('cover')}
            </>
          )}
          {source_link('place')}
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
          {source_link('connection')}
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
      {source_link('track')}
      {track.excerpt && (
        <p className="atlas-caption">
          Short excerpt. Full lyrics at the source.
        </p>
      )}
      <AtlasMusicLinks track={track} />
    </div>
  );
});
