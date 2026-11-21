import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import type { StudioHomeMode } from '@/lib/studio-home/types';

export type StudioHomeHeroProps = BrandContentProps & {
  mode: StudioHomeMode;
  onModeChange: (mode: StudioHomeMode) => void;
};
