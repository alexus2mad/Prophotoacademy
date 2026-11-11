'use client';

import { useEffect, useRef } from 'react';
import { enableDirectionRailDrag } from './rail-drag';
import type { StudioHomeDirectionsProps } from './types';

export function useDirectionRail(mode: StudioHomeDirectionsProps['mode']) {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (rail) return enableDirectionRailDrag(rail);
  }, [mode]);
  return railRef;
}
