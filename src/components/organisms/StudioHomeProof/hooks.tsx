'use client';

import { useEffect, useRef } from 'react';
import { enableHorizontalRailDrag } from '@/components/behaviors/HorizontalRail/drag';
import { enablePartnerMarquee } from './marquee';

export function usePartnerRail() {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    const firstCopy = rail?.querySelector('img');
    if (!rail || !firstCopy) return;
    const stopDragging = enableHorizontalRailDrag(rail);
    const stopMarquee = enablePartnerMarquee(rail, firstCopy);
    return () => {
      stopMarquee?.();
      stopDragging?.();
    };
  }, []);
  return railRef;
}
