'use client';

import { useEffect, useRef } from 'react';
import { enableHorizontalRailDrag } from '@/components/behaviors/HorizontalRail/drag';
export function useDirectionRail() {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (rail) return enableHorizontalRailDrag(rail);
  }, []);
  return railRef;
}
