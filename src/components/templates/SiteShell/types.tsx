import type { HubSettings, SiteSettings } from '@/lib/content/types';
import type { ReactNode } from 'react';
export type SiteShellProps = { children: ReactNode } & (
  | { site: 'academy'; settings: SiteSettings }
  | { site: 'hub'; settings: HubSettings }
);
