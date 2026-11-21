import type { SitePage } from '@/lib/site-editor/types';
import type { ReactNode } from 'react';
import type { StudioHomeDirection } from '@/lib/studio-home/types';

export type StudioHomeExperienceProps = { page?: SitePage } & {
  directions: StudioHomeDirection[];
  academy: ReactNode;
  studio: ReactNode;
  shop: ReactNode;
};
