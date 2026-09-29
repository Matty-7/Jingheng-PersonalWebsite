'use client';

import { useEffect } from 'react';

export function HomeMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const film_motion_query = window.matchMedia(
      '(min-width: 760px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)',
    );
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll('[data-reveal]')
      .forEach((el) => observer.observe(el));
    const filmSection = document.getElementById('films');
    const filmTrack = document.getElementById('film-track');
    const hero = document.querySelector<HTMLElement>('.arrival');
    const cards = Array.from(
      filmTrack?.querySelectorAll<HTMLElement>('.film-card') ?? [],
    );
    const posters = cards.map((card) =>
      card.querySelector<HTMLElement>('.poster-frame'),
    );
    let layout_dirty = true;
    let film_enabled = false;
    let distance = 0;
    let film_height = 0;
    let card_centres: number[] = [];
    let last_progress = -1;
    let raf = 0;
    const invalidate_layout = () => {
      layout_dirty = true;
      schedule();
    };
    const resizeObserver = new ResizeObserver(invalidate_layout);
    if (filmTrack) resizeObserver.observe(filmTrack);
    const reset_film_motion = () => {
      filmSection?.classList.remove('film-motion-ready');
      filmSection?.style.removeProperty('--film-height');
      filmSection?.style.removeProperty('--film-progress');
      filmSection?.style.removeProperty('height');
      filmTrack?.style.removeProperty('--film-transform');
      filmTrack?.style.removeProperty('transform');
      posters.forEach((el) => el?.style.removeProperty('--depth'));
      last_progress = -1;
    };
    // Layout writes and measurements happen only on initialization/resize.
    // Stable scrolling never measures transformed posters or changes section height.
    const measure_layout = () => {
      layout_dirty = false;
      film_enabled =
        film_motion_query.matches && CSS.supports('height', '1cqh');
      if (!filmSection || !filmTrack) return;
      if (!film_enabled) {
        reset_film_motion();
        return;
      }
      filmSection.classList.add('film-motion-ready');
      distance = Math.max(
        0,
        filmTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.09,
      );
      film_height = window.innerHeight + distance * 1.2;
      const height = `${film_height}px`;
      if (filmSection.style.getPropertyValue('--film-height') !== height) {
        filmSection.style.setProperty('--film-height', height);
      }
      const track_left = filmTrack.getBoundingClientRect().left;
      card_centres = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return rect.left - track_left + rect.width / 2;
      });
      last_progress = -1;
    };
    const update = () => {
      raf = 0;
      if (layout_dirty) measure_layout();

      // Read every live geometry value before applying this frame's styles.
      const viewport_height = window.innerHeight;
      const viewport_width = window.innerWidth;
      const page_progress =
        window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - viewport_height);
      const hero_rect = hero?.getBoundingClientRect();
      const hero_progress = hero_rect
        ? Math.min(
            1,
            Math.max(0, -hero_rect.top / Math.max(1, hero_rect.height)),
          )
        : 0;
      const film_rect = film_enabled
        ? filmSection?.getBoundingClientRect()
        : null;
      const film_progress = film_rect
        ? Math.max(
            0,
            Math.min(
              1,
              -film_rect.top / Math.max(1, film_height - viewport_height),
            ),
          )
        : 0;

      document.documentElement.style.setProperty(
        '--page-progress',
        String(page_progress),
      );
      hero?.style.setProperty(
        '--hero-progress',
        reduced.matches ? '0' : String(hero_progress),
      );
      if (
        film_enabled &&
        filmSection &&
        filmTrack &&
        film_progress !== last_progress
      ) {
        const translation = -film_progress * distance;
        filmTrack.style.setProperty(
          '--film-transform',
          `translate3d(${translation}px,0,0)`,
        );
        filmSection.style.setProperty('--film-progress', String(film_progress));
        posters.forEach((poster, index) => {
          const depth = Math.max(
            -1,
            Math.min(
              1,
              (card_centres[index] + translation - viewport_width / 2) /
                viewport_width,
            ),
          );
          poster?.style.setProperty('--depth', String(depth));
        });
        last_progress = film_progress;
      }
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', invalidate_layout);
    reduced.addEventListener('change', invalidate_layout);
    film_motion_query.addEventListener('change', invalidate_layout);
    update();
    return () => {
      reset_film_motion();
      document.documentElement.classList.remove('motion-ready');
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', invalidate_layout);
      reduced.removeEventListener('change', invalidate_layout);
      film_motion_query.removeEventListener('change', invalidate_layout);
      window.cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
