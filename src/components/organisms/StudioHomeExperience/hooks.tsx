'use client';
import { useEffect, useRef, useState } from 'react';
import type { StudioHomeMode } from '@/lib/studio-home/types';

function modeForFragment(hash: string): StudioHomeMode | undefined {
  if (hash === '#education-id') return 'academy';
  if (hash === '#equipment-selection') return 'shop';
  if (['#spaces', '#cyclorama', '#content-room', '#makeup', '#studio-booking'].includes(hash)) {
    return 'studio';
  }
}

export function useStudioHomeExperience() {
  const [mode, setMode] = useState<StudioHomeMode>('academy');
  const directionsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const followFragment = () => {
      const linkedMode = modeForFragment(window.location.hash);
      if (linkedMode) setMode(linkedMode);
    };
    followFragment();
    window.addEventListener('hashchange', followFragment);
    return () => window.removeEventListener('hashchange', followFragment);
  }, []);

  useEffect(() => {
    const { hash } = window.location;
    if (modeForFragment(hash) === mode) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [mode]);

  function selectMode(next: StudioHomeMode) {
    const url = new URL(window.location.href);
    const linkedMode = modeForFragment(url.hash);
    if (linkedMode && linkedMode !== next) {
      url.hash = '';
      window.history.replaceState(window.history.state, '', url);
    }
    setMode(next);
  }

  return { mode, selectMode, directionsRef };
}
