'use client';

import { useSyncExternalStore } from 'react';
import type { LinkProps } from 'next/link';
import { studioHomeBrandFragments } from '@/lib/studio-home/navigation';
import type { StudioHomeMode } from '@/lib/studio-home/types';

function subscribeToFragment(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

export function useStudioHomeFragment() {
  return useSyncExternalStore(
    subscribeToFragment,
    () => window.location.hash,
    () => '',
  );
}

export function selectStudioHomeBrand(mode: StudioHomeMode) {
  window.location.hash = studioHomeBrandFragments[mode];
}

export function studioHomeBrandNavigation(
  home: boolean,
  mode: StudioHomeMode,
  onActivation?: () => void,
): LinkProps['onNavigate'] {
  return (event) => {
    onActivation?.();
    if (!home) return;
    event.preventDefault();
    selectStudioHomeBrand(mode);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
}
