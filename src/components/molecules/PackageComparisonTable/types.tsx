import type { Package } from '@/lib/content/types';
export type ComparisonPackage = Package & {
  statusLabel: string;
  purchaseUrl?: string;
  inquiryAllowed: boolean;
};
export type PackageComparisonTableProps = {
  items: ComparisonPackage[];
  programTitle: string;
  onClose: () => void;
  onInquire: (pack: ComparisonPackage) => void;
};
