import type { ReactNode } from 'react';

export type StudioProgramNavigationLink = readonly [href: string, label: string];

export type StudioProgramNavigationProps = {
  links: readonly StudioProgramNavigationLink[];
  children: ReactNode;
};
