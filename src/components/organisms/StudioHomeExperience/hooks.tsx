'use client';
import { useEffect, useRef } from 'react';
import {
  selectStudioHomeBrand,
  useStudioHomeFragment,
} from '@/components/behaviors/StudioHomeNavigation/hooks';
import {
  studioHomeBrandForFragment,
  studioHomeModeForFragment,
  studioHomeSectionBrand,
} from '@/lib/studio-home/navigation';
import type { StudioHomeMode } from '@/lib/studio-home/types';

export function useStudioHomeExperience() {
  const hash = useStudioHomeFragment();
  const mode = studioHomeModeForFragment(hash);
  const directionsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (studioHomeBrandForFragment(window.location.hash)) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    if (studioHomeSectionBrand(hash)) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  function selectMode(next: StudioHomeMode) {
    if (next !== mode) selectStudioHomeBrand(next);
  }

  return { mode, selectMode, directionsRef };
}
