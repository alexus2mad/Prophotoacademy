import type { SitePage } from '@/lib/site-editor/types';
import type { ReactNode } from 'react';
import type { StudioHomeDirection } from '@/lib/studio-home/types';

export type StudioHomeExperienceProps = { page?: SitePage } & {
  beforeHero?: Partial<Record<'academy' | 'studio' | 'shop', ReactNode>>;
  directions: StudioHomeDirection[];
  academy: ReactNode;
  studio: ReactNode;
  shop: ReactNode;
};
