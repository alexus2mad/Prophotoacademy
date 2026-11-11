'use client';

import { useEffect, useRef } from 'react';
import { enableHorizontalRailDrag } from '@/components/behaviors/HorizontalRail/drag';
import type { StudioHomeDirectionsProps } from './types';

export function useDirectionRail(mode: StudioHomeDirectionsProps['mode']) {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (rail) return enableHorizontalRailDrag(rail);
  }, [mode]);
  return railRef;
}
