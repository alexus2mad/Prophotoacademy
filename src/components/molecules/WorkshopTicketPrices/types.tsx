import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';

export type WorkshopTicketPricesProps = {
  ticket: WorkshopTicketPresentation;
  editing?: boolean;
  /** Anchor target for links that lead to the ticket choice. */
  id?: string;
};
