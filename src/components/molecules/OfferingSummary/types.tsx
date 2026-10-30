import type { Offering, Program } from '@/lib/content/types';

export type OfferingSummaryProps = {
  program: Program;
  offering: Offering;
  packageId?: string;
  packageName?: string;
};
