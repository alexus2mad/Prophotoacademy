import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';
import type { SitePage } from '@/lib/site-editor/types';
export type MarketingSlotProps = {
  page?: SitePage;
  id: string;
  ticket?: WorkshopTicketPresentation;
};
