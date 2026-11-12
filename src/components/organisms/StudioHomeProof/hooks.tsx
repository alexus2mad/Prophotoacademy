'use client';

import { useEffect, useRef, useState } from 'react';
import { enableHorizontalRailDrag } from '@/components/behaviors/HorizontalRail/drag';
import { enablePartnerMarquee } from './marquee';

export function usePartnerRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const [copyCount, setCopyCount] = useState(2);

  useEffect(() => {
    const rail = railRef.current;
    const firstCopy = rail?.querySelector<HTMLElement>('[data-partner-copy]');
    if (!rail || !firstCopy) return;
    const measure = () => {
      const width = firstCopy.getBoundingClientRect().width;
      if (width <= 0) return;
      // Cover the viewport plus one complete repeat. Resize alone changes the
      // number of copies; autoplay never appends nodes or retains past frames.
      setCopyCount(Math.max(2, Math.ceil(rail.clientWidth / width) + 1));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    observer.observe(firstCopy);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const firstCopy = rail?.querySelector<HTMLElement>('[data-partner-copy]');
    if (!rail || !firstCopy) return;
    const stopDragging = enableHorizontalRailDrag(rail);
    const stopMarquee = enablePartnerMarquee(rail, firstCopy);
    return () => {
      stopMarquee?.();
      stopDragging?.();
    };
  }, []);
  return { railRef, copyCount };
}
