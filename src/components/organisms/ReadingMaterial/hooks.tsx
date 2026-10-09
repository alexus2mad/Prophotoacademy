'use client';
import { useEffect, useRef } from 'react';
import { mostVisibleReadingBlock, readingActive } from '@/lib/learning/browser';
import type { ReadingMaterialProps } from './types';
export function useReadingMaterial({ block, onProgress, url }: ReadingMaterialProps) {
  const ref = useRef<HTMLElement>(null),
    callback = useRef(onProgress);
  callback.current = onProgress;
  useEffect(() => {
    let lastActivity = Date.now(),
      lastTick = Date.now(),
      elapsed = 0,
      coverage = new Set<number>();
    const active = () => {
      lastActivity = Date.now();
    };
    const flush = () => {
      if (elapsed > 0) {
        callback.current({
          blockId: block.id,
          revision: block.revision,
          elapsed: Math.min(30, elapsed),
          coverage: [...coverage],
        });
        elapsed = 0;
        coverage = new Set();
      }
    };
    const tick = () => {
      const now = Date.now(),
        delta = Math.min(2, (now - lastTick) / 1000);
      lastTick = now;
      const dominant = mostVisibleReadingBlock();
      if (
        !readingActive() ||
        now - lastActivity > 90000 ||
        dominant?.element !== ref.current ||
        dominant.visible < 80
      )
        return;
      const image = ref.current?.querySelector('img');
      if (block.kind === 'image' && (!image?.complete || !image.naturalWidth)) return;
      elapsed += delta;
      const rect = ref.current!.getBoundingClientRect();
      const start = Math.max(0, (80 - rect.top) / rect.height),
        end = Math.min(1, (innerHeight - 76 - rect.top) / rect.height);
      for (let i = Math.floor(start * 100); i < Math.ceil(end * 100); i++)
        if (i >= 0 && i < 100) coverage.add(i);
      if (elapsed >= 10 || (block.kind === 'image' && elapsed >= 5)) flush();
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
