import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';
import type { SitePage } from '@/lib/site-editor/types';
export type MarketingCompositionProps = {
  page?: SitePage;
  ticket?: WorkshopTicketPresentation;
  within?: 'home-panel-studio' | 'home-panel-shop' | 'homepage';
  part?: 'typography' | 'blocks';
};
