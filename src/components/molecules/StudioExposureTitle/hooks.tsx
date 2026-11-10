'use client';
import { useEffect, useRef, useState } from 'react';
import { canMorphExposureWords } from './selectors';
import type { ExposureTitleLayout } from './types';

export function useStudioExposureTitle() {
  const root = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ExposureTitleLayout | null>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const stage = element.closest<HTMLElement>('[data-exposure-stage]');
    const meter = stage?.querySelector<HTMLElement>('[data-exposure-meter]');
    const target = element.querySelector<HTMLElement>('[data-title-target]');
    if (!stage || !meter || !target) return;
    const mobile = window.matchMedia('(max-width: 760px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let disposed = false;
    const measure = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const bounds = element.getBoundingClientRect();
      const stageBounds = stage.getBoundingClientRect();
      const targetBounds = target.getBoundingClientRect();
      const targetShiftX =
        stageBounds.left + stageBounds.width / 2 - (targetBounds.left + targetBounds.width / 2);
      const availableHeight = Math.max(0, meter.getBoundingClientRect().top - bounds.top - 24);
      const targetTop = bounds.top + Math.max(0, (availableHeight - targetBounds.height) / 2);
      const sources = [...element.querySelectorAll<HTMLElement>('[data-title-source-word]')];
      const targets = [...target.querySelectorAll<HTMLElement>('[data-title-target-word]')];
      const copies = [...element.querySelectorAll<HTMLElement>('[data-title-copy-word]')];
      if (!bounds.width || sources.length !== targets.length || sources.length !== copies.length)
        return;
      const sourceBounds = sources.map((word) => word.getBoundingClientRect());
      const destinations = targets.map((word) => word.getBoundingClientRect());
      const eligible =
        sources.every((word) => word.getClientRects().length === 1) &&
        canMorphExposureWords(sourceBounds, destinations, bounds.width);
      const words = sourceBounds.map((sourceWord, index) => {
        const destination = destinations[index];
        const copy = copies[index];
        const copyBounds = copy.getBoundingClientRect();
        const glyphBounds = copy.firstElementChild!.getBoundingClientRect();
        // Inline glyph metrics can exceed the line box. Subtract this local offset,
        // which is unaffected by the copy's current transform, to preserve its baseline.
        const glyphX = glyphBounds.left - copyBounds.left;
        const glyphY = glyphBounds.top - copyBounds.top;
        return {
          source: {
            x: sourceWord.left - bounds.left - glyphX,
            y: sourceWord.top - bounds.top - glyphY,
          },
          target: {
            x: destination.left + targetShiftX - bounds.left - glyphX,
            y: destination.top - targetBounds.top + targetTop - bounds.top - glyphY,
          },
        };
      });
      setLayout({ words, mobile: mobile.matches, reducedMotion: motion.matches, eligible });
    };
    const schedule = () => {
      if (!disposed && !frame) frame = window.requestAnimationFrame(measure);
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    [element, stage, meter, target].forEach((item) => observer?.observe(item));
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
    mobile.addEventListener('change', schedule);
    motion.addEventListener('change', schedule);
    document.fonts?.addEventListener('loadingdone', schedule);
    void document.fonts?.ready.then(schedule);
    measure();
    return () => {
      disposed = true;
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule);
      document.removeEventListener('visibilitychange', schedule);
      mobile.removeEventListener('change', schedule);
      motion.removeEventListener('change', schedule);
      document.fonts?.removeEventListener('loadingdone', schedule);
    };
  }, []);
  return { root, layout };
}
