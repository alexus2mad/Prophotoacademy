'use client';
import { useEffect } from 'react';

export function useDirectionCardMotion() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const mobile = window.matchMedia('(max-width: 899px), (hover: none)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cards = [...document.querySelectorAll<HTMLElement>('.academy-direction')];
    let observer: IntersectionObserver | undefined;
    let frame = 0;

    const observe = () => {
      frame = 0;
      observer?.disconnect();
      observer = undefined;
      if (!mobile.matches || reducedMotion.matches) {
        for (const card of cards) card.removeAttribute('data-scroll-active');
        return;
      }

      // The center line activates a card (or a tablet row), like pointer hover.
      // Pixel margins use viewport height; percentage observer margins use width.
      const inset = Math.max(0, Math.floor(window.innerHeight / 2) - 1);
      const current = new IntersectionObserver(
        (entries) => {
          if (observer !== current) return;
          for (const entry of entries) {
            entry.target.toggleAttribute('data-scroll-active', entry.isIntersecting);
          }
        },
        { rootMargin: `-${inset}px 0px -${inset}px 0px` },
      );
      observer = current;
      for (const card of cards) current.observe(card);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(observe);
    };
    observe();
    mobile.addEventListener('change', schedule);
    reducedMotion.addEventListener('change', schedule);
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      observer = undefined;
      mobile.removeEventListener('change', schedule);
      reducedMotion.removeEventListener('change', schedule);
      window.removeEventListener('resize', schedule);
      for (const card of cards) card.removeAttribute('data-scroll-active');
    };
  }, []);
}
