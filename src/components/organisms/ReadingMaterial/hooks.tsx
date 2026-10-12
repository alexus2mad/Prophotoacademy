'use client';
import { useEffect, useRef } from 'react';
import { mostVisibleReadingBlock, readingActive } from '@/lib/learning/browser';
import { createReadingTracker } from '@/lib/learning/reading';
import type { ReadingMaterialProps } from './types';
export function useReadingMaterial({ block, onProgress, url }: ReadingMaterialProps) {
  const ref = useRef<HTMLElement>(null),
    callback = useRef(onProgress);
  callback.current = onProgress;
  useEffect(() => {
    let lastActivity = Date.now();
    const tracker = createReadingTracker(
      (sample) =>
        callback.current({
          blockId: block.id,
          revision: block.revision,
          ...sample,
        }),
      block.kind === 'image' ? 5 : 10,
    );
    const active = () => {
      lastActivity = Date.now();
    };
    const flush = tracker.flush;
    const tick = () => {
      const now = Date.now();
      const dominant = mostVisibleReadingBlock();
      if (
        !readingActive() ||
        now - lastActivity > 90000 ||
        dominant?.element !== ref.current ||
        dominant.visible < 80
      ) {
        tracker.tick(now, null);
        return;
      }
      const image = ref.current?.querySelector('img');
      if (block.kind === 'image' && (!image?.complete || !image.naturalWidth)) {
        tracker.tick(now, null);
        return;
      }
      const rect = ref.current!.getBoundingClientRect();
      const start = Math.max(0, (80 - rect.top) / rect.height),
        end = Math.min(1, (innerHeight - 76 - rect.top) / rect.height);
      const coverage: number[] = [];
      for (let i = Math.floor(start * 100); i < Math.ceil(end * 100); i++)
        if (i >= 0 && i < 100) coverage.push(i);
      tracker.tick(now, coverage);
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((name) => window.addEventListener(name, active, { passive: true }));
    const timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      clearInterval(timer);
      events.forEach((name) => window.removeEventListener(name, active));
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [block.id, block.revision, block.kind, url]);
  return ref;
}
