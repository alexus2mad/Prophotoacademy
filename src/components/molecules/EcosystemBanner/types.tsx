import type { ImageAsset } from '@/lib/content/types';
export type EcosystemBannerProps = {
  name: 'STUDIO' | 'SHOP';
  label: string;
  description: string;
  href: string;
  linkLabel: string;
  image: ImageAsset;
};
