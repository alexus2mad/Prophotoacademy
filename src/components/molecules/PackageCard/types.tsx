import type { Offering, Package, Program } from '@/lib/content/types';
export type PackageCardLayout = 'summary-first' | 'benefits-first';
export type PackageCardProps = {
  offering: Offering;
  program: Program;
  pack: Package;
  enrollable?: boolean;
  paymentDisabled?: boolean;
  availableLessons?: string[];
  layout?: PackageCardLayout;
};
