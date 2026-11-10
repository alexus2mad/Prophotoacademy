'use client';
import { useEffect, useRef, useState } from 'react';
import { studioExposureState } from '@/lib/studio-home/exposure';
import type { StudioHomeMode } from '@/lib/studio-home/types';

export function useStudioHomeExposure(mode: StudioHomeMode) {
  const section = useRef<HTMLElement>(null);
  const [exposure, setExposure] = useState(() =>
    studioExposureState({
      top: 0,
      height: 1,
      viewportHeight: 1,
      mobile: false,
      reducedMotion: true,
    }),
  );
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 760px)');
    let frame = 0;
    let disposed = false;
    const measure = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const bounds = element.getBoundingClientRect();
      const next = studioExposureState({
        top: bounds.top,
        height: bounds.height,
        viewportHeight: window.innerHeight,
        mobile: mobile.matches,
        reducedMotion: motion.matches,
      });
      setExposure((previous) =>
        previous.progress === next.progress &&
        previous.transition === next.transition &&
        previous.activeBars === next.activeBars &&
        previous.redBars === next.redBars &&
        previous.redStart === next.redStart &&
        previous.value === next.value
          ? previous
          : next,
      );
      setReady(true);
    };
    const update = () => {
      if (!disposed && !frame && !document.hidden) frame = window.requestAnimationFrame(measure);
    };
    const synchronize = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      measure();
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('pageshow', synchronize);
    document.addEventListener('visibilitychange', synchronize);
    motion.addEventListener('change', synchronize);
    mobile.addEventListener('change', synchronize);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    measure();
    return () => {
      disposed = true;
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', synchronize);
      document.removeEventListener('visibilitychange', synchronize);
      motion.removeEventListener('change', synchronize);
      mobile.removeEventListener('change', synchronize);
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [mode]);
  return { section, exposure, ready };
}
