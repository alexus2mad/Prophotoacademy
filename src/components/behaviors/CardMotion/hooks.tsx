'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useCardMotion() {
  const path = usePathname();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const root = document.querySelector('.academy-editorial');
    if (!root) return;
    const mobile = window.matchMedia('(max-width: 899px), (hover: none)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cards = new Set<Element>();
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    let disposed = false;

    const scan = () => {
      if (disposed) return;
      // Suspense content must hydrate before this controller mutates its attributes.
      const next = new Set(
        Array.from(root.querySelectorAll('[data-card-motion]')).filter(
          (card) => !card.closest('[data-card-motion-pending]'),
        ),
      );
      for (const card of cards) {
        if (!next.has(card)) {
          observer?.unobserve(card);
          card.removeAttribute('data-scroll-active');
          cards.delete(card);
        }
      }
      for (const card of next) {
        if (cards.has(card)) continue;
        cards.add(card);
        observer?.observe(card);
      }
    };

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
            if (!cards.has(entry.target)) continue;
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
    scan();
    observe();
    const mutations = new MutationObserver(scan);
    mutations.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-card-motion-pending'],
    });
    mobile.addEventListener('change', schedule);
    reducedMotion.addEventListener('change', schedule);
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer?.disconnect();
      observer = undefined;
      mobile.removeEventListener('change', schedule);
      reducedMotion.removeEventListener('change', schedule);
      window.removeEventListener('resize', schedule);
      for (const card of cards) card.removeAttribute('data-scroll-active');
    };
  }, [path]);
}
