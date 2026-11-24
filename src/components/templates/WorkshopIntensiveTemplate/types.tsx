import type { SitePage } from '@/lib/site-editor/types';
import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';

export type WorkshopIntensiveTemplateProps = {
  page: SitePage;
  ticket?: WorkshopTicketPresentation;
};
