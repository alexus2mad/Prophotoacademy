import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';
export type WorkshopCheckoutActionProps = {
  ticket?: WorkshopTicketPresentation;
  editing?: boolean;
  preview?: boolean;
};
