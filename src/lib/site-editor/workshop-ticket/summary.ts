import type { WorkshopTicketPresentation } from './types';

/** «3 700 / 2 500 грн» for every ticket of a workshop. */
export const ticketPriceSummary = (
  ticket: Pick<WorkshopTicketPresentation, 'options' | 'currency'>,
) => ticket.options.map((option) => option.price).join(' / ') + ' ' + ticket.currency;
