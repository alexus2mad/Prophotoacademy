'use client';
import { useState } from 'react';
import type { StudioHomeMode } from '@/lib/studio-home/types';
import { useStudioHomeExposure } from '@/components/organisms/StudioHomeExposure/hooks';

export function useStudioHomeExperience() {
  const [mode, setMode] = useState<StudioHomeMode>('academy');
  const { section, exposure, ready } = useStudioHomeExposure(mode);
  return { mode, setMode, section, exposure, ready };
}
