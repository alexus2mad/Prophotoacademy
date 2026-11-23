import type { ReactNode } from 'react';
import type { Package } from '@/lib/content/types';
export type DisclosurePackageCardProps = {
  pack: Package;
  summary: string;
  price: ReactNode;
  action: ReactNode;
  benefits: ReactNode;
  installments: ReactNode;
};
