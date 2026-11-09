'use client';
import { useState } from 'react';
import type { StudioHomeMode } from '@/lib/studio-home/types';

export function useStudioHomeExperience() {
  const [mode, setMode] = useState<StudioHomeMode>('academy');
  return { mode, setMode };
}
