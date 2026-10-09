'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { MotionEntry } from './types';

const frames =
  '.exhibition-hero,.program-hero-photo,.learning-photo,.instructor-photo,.course-image,.preview-photo,.work-image,.hub-opening-photo,.room-photo,.hub-detail-opening>figure,.practice-preview-photo';
const clamp = (value: number) => Math.max(-1, Math.min(1, value));
function mountMotion() {
  const entries = new Map<HTMLElement, MotionEntry>();
  const visible = new Set<HTMLElement>();
  let raf = 0;
  const update = () => {
    raf = 0;
    if (document.hidden) return;
    const positions = [...visible]
      .filter((frame) => frame.isConnected)
      .map((frame) => {
        const entry = entries.get(frame)!;
        const rect = frame.getBoundingClientRect();
        const progress = clamp(
          (innerHeight / 2 - rect.top - rect.height / 2) / (innerHeight / 2 + rect.height / 2),
        );
        const x = entry.pointer ? clamp(((entry.pointer.x - rect.left) / rect.width) * 2 - 1) : 0;
        const y = entry.pointer ? clamp(((entry.pointer.y - rect.top) / rect.height) * 2 - 1) : 0;
        return {
          image: entry.image,
          x: x * Math.min(entry.image.clientWidth * 0.008, 5),
          y:
            progress * Math.min(entry.image.clientHeight * 0.012, 8) +
            y * Math.min(entry.image.clientHeight * 0.005, 3),
        };
      });
    for (const { image, x, y } of positions) {
      image.style.setProperty('--photo-x', `${x.toFixed(2)}px`);
      image.style.setProperty('--photo-y', `${y.toFixed(2)}px`);
    }
  };
  const schedule = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(update);
  };
  const observer = new IntersectionObserver(
    (changes) => {
      for (const entry of changes) {
        const frame = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(frame);
        else visible.delete(frame);
        frame.dataset.motionVisible = String(entry.isIntersecting);
      }
      schedule();
    },
    { rootMargin: '40px' },
  );
  const scan = () => {
    for (const frame of document.querySelectorAll<HTMLElement>(frames)) {
      if (entries.has(frame)) continue;
      const image = frame.querySelector<HTMLImageElement>('img');
      if (!image || image.style.objectFit === 'contain') continue;
      const pointer = (event: PointerEvent) => {
        if (event.pointerType === 'mouse') {
          entries.get(frame)!.pointer = { x: event.clientX, y: event.clientY };
          schedule();
        }
      };
      const leave = () => {
        entries.get(frame)!.pointer = null;
        schedule();
      };
      frame.dataset.photoMotion = '';
      image.classList.add('motion-photo');
      frame.addEventListener('pointermove', pointer, { passive: true });
      frame.addEventListener('pointerleave', leave);
      entries.set(frame, {
        image,
        pointer: null,
        cleanup: () => {
          frame.removeEventListener('pointermove', pointer);
          frame.removeEventListener('pointerleave', leave);
        },
      });
      observer.observe(frame);
    }
    for (const [frame, entry] of entries)
      if (!frame.isConnected) {
        entry.cleanup();
        observer.unobserve(frame);
        visible.delete(frame);
        entries.delete(frame);
      }
    schedule();
  };
  scan();
  const mutations = new MutationObserver(scan);
  const main = document.querySelector('main');
  if (main) mutations.observe(main, { childList: true, subtree: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  return () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
    mutations.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('visibilitychange', schedule);
    for (const [frame, entry] of entries) {
      entry.cleanup();
      delete frame.dataset.photoMotion;
      delete frame.dataset.motionVisible;
      entry.image.classList.remove('motion-photo');
      entry.image.style.removeProperty('--photo-x');
      entry.image.style.removeProperty('--photo-y');
    }
  };
}
export function usePhotographyMotion() {
  const path = usePathname();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cleanup = () => {};
    const apply = () => {
      cleanup();
      cleanup = preference.matches ? () => {} : mountMotion();
    };
    apply();
    preference.addEventListener('change', apply);
    return () => {
      preference.removeEventListener('change', apply);
      cleanup();
    };
  }, [path]);
}
