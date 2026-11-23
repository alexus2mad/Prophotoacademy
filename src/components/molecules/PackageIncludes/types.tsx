import type { Package } from '@/lib/content/types';
export type PackageIncludesProps = {
  pack: Package;
  emphasis?: (text: string) => string | undefined;
};
