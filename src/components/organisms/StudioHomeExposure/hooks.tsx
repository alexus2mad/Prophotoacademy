'use client';
import { useEffect, useRef, useState } from 'react';
import {
  smoothExposureProgress,
  studioExposureAtProgress,
  studioExposureState,
} from '@/lib/studio-home/exposure';
import type { StudioHomeMode } from '@/lib/studio-home/types';

export function useStudioHomeExposure(mode: StudioHomeMode) {
  const section = useRef<HTMLElement>(null);
  const [exposure, setExposure] = useState(() =>
    studioExposureState({
      top: 0,
      height: 1,
      stageHeight: 1,
      reducedMotion: true,
    }),
  );
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const stage = element.querySelector<HTMLElement>('[data-exposure-stage]');
    if (!stage) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let disposed = false;
    let currentProgress: number | null = null;
    let targetProgress = 0;
    let lastFrame = 0;
    let geometryChanged = true;
    let measuredGeometry = { sectionHeight: 0, stageHeight: 0, stageWidth: 0, stickyOffset: 0 };
    const measureTarget = () => {
      const bounds = element.getBoundingClientRect();
      const stageBounds = stage.getBoundingClientRect();
      const geometry = {
        sectionHeight: bounds.height,
        stageHeight: stageBounds.height,
        stageWidth: stageBounds.width,
        stickyOffset: Number.parseFloat(window.getComputedStyle(stage).top) || 0,
      };
      const layoutChanged =
        geometry.sectionHeight !== measuredGeometry.sectionHeight ||
        geometry.stageHeight !== measuredGeometry.stageHeight ||
        geometry.stageWidth !== measuredGeometry.stageWidth ||
        geometry.stickyOffset !== measuredGeometry.stickyOffset;
      measuredGeometry = geometry;
      targetProgress = studioExposureState({
        top: bounds.top,
        height: bounds.height,
        // svh fixes the runway while mobile browser chrome expands or retracts.
        // Neither a changing visual viewport nor the floating header defines it.
        stageHeight: geometry.stageHeight,
        stickyOffset: geometry.stickyOffset,
        reducedMotion: motion.matches,
      }).progress;
      return (
        layoutChanged || motion.matches || bounds.bottom <= 0 || bounds.top >= window.innerHeight
      );
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || document.hidden) return;
      const snap = geometryChanged && measureTarget();
      geometryChanged = false;
      currentProgress =
        currentProgress === null || snap
          ? targetProgress
          : smoothExposureProgress(currentProgress, targetProgress, now - lastFrame);
      lastFrame = now;
      const next = studioExposureAtProgress(currentProgress);
      setExposure((previous) =>
        previous.progress === next.progress &&
        previous.activeBars === next.activeBars &&
        previous.redBars === next.redBars &&
        previous.redStart === next.redStart &&
        previous.value === next.value
          ? previous
          : next,
      );
      setReady(true);
      if (currentProgress !== targetProgress) frame = window.requestAnimationFrame(render);
    };
    const update = () => {
      geometryChanged = true;
      if (!disposed && !frame && !document.hidden) {
        lastFrame = performance.now();
        frame = window.requestAnimationFrame(render);
      }
    };
    const synchronize = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      currentProgress = null;
      geometryChanged = true;
      render(performance.now());
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('pageshow', synchronize);
    document.addEventListener('visibilitychange', synchronize);
    motion.addEventListener('change', synchronize);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    observer?.observe(stage);
    synchronize();
    return () => {
      disposed = true;
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', synchronize);
      document.removeEventListener('visibilitychange', synchronize);
      motion.removeEventListener('change', synchronize);
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [mode]);
  return { section, exposure, ready };
}
