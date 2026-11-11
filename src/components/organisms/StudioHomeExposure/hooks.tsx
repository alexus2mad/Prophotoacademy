'use client';
import { useEffect, useRef, useState } from 'react';
import {
  smoothExposureProgress,
  studioCompactExposureAtProgress,
  studioCompactExposureState,
  studioExposureAtProgress,
  studioExposureState,
} from '@/lib/studio-home/exposure';
import type { StudioHomeMode } from '@/lib/studio-home/types';
import type { StudioHomeExposureProps } from './types';

export function useStudioHomeExposure(
  mode: StudioHomeMode,
  directionsRef?: StudioHomeExposureProps['directionsRef'],
) {
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
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const stage = element.querySelector<HTMLElement>('[data-exposure-stage]');
    if (!stage) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compactLayout = window.matchMedia('(max-width: 760px)');
    let frame = 0;
    let disposed = false;
    let currentProgress: number | null = null;
    let targetProgress = 0;
    let lastFrame = 0;
    let geometryChanged = true;
    // Mobile browser chrome changes innerHeight during a gesture. Keep this
    // timeline stable until the layout width/orientation or page context changes.
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let orientation = window.screen?.orientation?.type;
    let measuredGeometry = { sectionHeight: 0, stageHeight: 0, stageWidth: 0, stickyOffset: 0 };
    const measureTarget = () => {
      const bounds = element.getBoundingClientRect();
      if (compactLayout.matches) {
        targetProgress = studioCompactExposureState({
          top: bounds.top,
          height: bounds.height,
          viewportHeight,
          reducedMotion: motion.matches,
        }).progress;
        return true;
      }
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
        // The desktop runway follows its rendered svh stage, not browser chrome.
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
        currentProgress === null || snap || compactLayout.matches
          ? targetProgress
          : smoothExposureProgress(currentProgress, targetProgress, now - lastFrame);
      lastFrame = now;
      const next = compactLayout.matches
        ? studioCompactExposureAtProgress(currentProgress, motion.matches)
        : studioExposureAtProgress(currentProgress);
      // Only this small scene rerenders. Its sibling keeps the photographic cards
      // intact and receives presentation progress through its explicit element ref.
      const directions = directionsRef?.current;
      if (directions) {
        if (compactLayout.matches)
          directions.style.setProperty('--mobile-exposure', String(next.progress));
        else directions.style.removeProperty('--mobile-exposure');
        const tone = compactLayout.matches && next.progress < 0.5 ? 'dark' : 'light';
        if (directions.getAttribute('data-header-tone') !== tone)
          directions.setAttribute('data-header-tone', tone);
      }
      setExposure((previous) =>
        previous.progress === next.progress &&
        previous.activeBars === next.activeBars &&
        previous.redBars === next.redBars &&
        previous.redStart === next.redStart &&
        previous.value === next.value
          ? previous
          : next,
      );
      setCompact(compactLayout.matches);
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
    const restore = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      orientation = window.screen?.orientation?.type;
      synchronize();
    };
    const resize = () => {
      const nextOrientation = window.screen?.orientation?.type;
      const layoutChanged = window.innerWidth !== viewportWidth || nextOrientation !== orientation;
      if (compactLayout.matches && !layoutChanged) return;
      if (layoutChanged) {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        orientation = nextOrientation;
      }
      update();
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', restore);
    window.addEventListener('pageshow', restore);
    document.addEventListener('visibilitychange', restore);
    motion.addEventListener('change', synchronize);
    compactLayout.addEventListener('change', restore);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    observer?.observe(stage);
    synchronize();
    return () => {
      disposed = true;
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', restore);
      window.removeEventListener('pageshow', restore);
      document.removeEventListener('visibilitychange', restore);
      motion.removeEventListener('change', synchronize);
      compactLayout.removeEventListener('change', restore);
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      directionsRef?.current?.style.removeProperty('--mobile-exposure');
    };
  }, [mode, directionsRef]);
  return { section, exposure, ready, compact };
}
