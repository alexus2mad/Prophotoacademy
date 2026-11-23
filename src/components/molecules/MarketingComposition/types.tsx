import type { SitePage } from '@/lib/site-editor/types';
export type MarketingCompositionProps = {
  page?: SitePage;
  within?: 'home-panel-studio' | 'home-panel-shop' | 'homepage';
  part?: 'typography' | 'blocks';
};
