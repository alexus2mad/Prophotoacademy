import type { ComponentProps } from 'react';

export type FragmentLinkProps = Omit<
  ComponentProps<'a'>,
  'href' | 'onClick' | 'target' | 'download'
> & {
  targetId: string;
};
