import type { SiteSection } from '@/lib/site-editor/types';
import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';
export type MarketingBlockProps = {
  section: SiteSection;
  editing?: boolean;
  preview?: boolean;
  ticket?: WorkshopTicketPresentation;
  ticketAnnounced?: boolean;
  ticketOfferId?: string;
};
