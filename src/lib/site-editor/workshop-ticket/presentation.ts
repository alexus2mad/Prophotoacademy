import {
  findWorkshopOffer,
  workshopCheckout,
  workshopOffers,
} from '@/lib/commerce/workshop-offers';
import type { SitePage } from '../types';
import type { WorkshopTicketChoice, WorkshopTicketPresentation } from './types';

async function ticketFor(path: string): Promise<WorkshopTicketPresentation | undefined> {
  const checkout = await workshopCheckout(path);
  if (!checkout || checkout.price == null) return;
  const amount = checkout.price;
  return {
    href: checkout.href ?? '',
    amount,
    price: new Intl.NumberFormat('uk-UA').format(amount),
    currency: 'грн',
  };
}

export async function workshopTicket(page: SitePage) {
  if (
    !page.offerId ||
    page.kind !== 'workshop' ||
    page.template !== 'workshop-intensive' ||
    findWorkshopOffer(page.path)?.offering.id !== page.offerId
  )
    return;
  return ticketFor(page.path);
}

export async function workshopTicketChoices(): Promise<WorkshopTicketChoice[]> {
  const choices = await Promise.all(
    workshopOffers.map(async ({ path, offering, program }) => {
      const presentation = await ticketFor(path);
      return presentation && { path, id: offering.id, label: program.title, presentation };
    }),
  );
  return choices.filter((choice): choice is WorkshopTicketChoice => !!choice);
}
