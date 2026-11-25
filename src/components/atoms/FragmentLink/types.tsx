import type { ComponentProps } from 'react';
import type Link from 'next/link';

export type FragmentLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'onNavigate'> & {
  targetId: string;
};
