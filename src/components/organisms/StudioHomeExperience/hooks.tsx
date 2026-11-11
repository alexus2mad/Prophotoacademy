'use client';
import { useRef, useState } from 'react';
import type { StudioHomeMode } from '@/lib/studio-home/types';

export function useStudioHomeExperience() {
  const [mode, setMode] = useState<StudioHomeMode>('academy');
  const directionsRef = useRef<HTMLElement>(null);
  return { mode, setMode, directionsRef };
}
