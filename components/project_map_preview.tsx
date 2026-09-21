import Image from 'next/image';
import Link from 'next/link';

type ProjectMapPreviewProps = {
  href: string;
  label: string;
  artwork: { src: string; alt: string; width: number; height: number };
  eyebrow: string;
  headline: string;
  emphasis: string;
  summary: string;
};

export function ProjectMapPreview({
  href,
  label,
  artwork,
  eyebrow,
  headline,
  emphasis,
  summary,
}: ProjectMapPreviewProps) {
  return (
    <Link className="project-culture-preview" href={href} aria-label={label}>
      <span className="project-culture-artwork">
        <Image {...artwork} unoptimized loading="lazy" />
      </span>
      <span className="project-culture-copy">
        <small>{eyebrow}</small>
        <strong>{headline}<br /><em>{emphasis}</em></strong>
        <span className="project-culture-summary">
          <span>{summary}</span><span aria-hidden="true">↗</span>
        </span>
      </span>
    </Link>
  );
}
