import type { ComparisonPackage } from '@/components/molecules/PackageComparisonTable/types';
export type PackageComparisonProps = {
  packages: ComparisonPackage[];
  programId: string;
  offeringId: string;
  programTitle: string;
};
