import type { ReactNode } from 'react';

export type CheckoutDialogProps = {
  children: ReactNode;
  closeHref: string;
  intercepted?: boolean;
};
