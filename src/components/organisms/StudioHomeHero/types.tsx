import type { StudioHomeMode } from '@/lib/studio-home/types';

export type StudioHomeHeroProps = {
  mode: StudioHomeMode;
  onModeChange: (mode: StudioHomeMode) => void;
};

export type HeroTouchOrigin = { x: number; y: number };
