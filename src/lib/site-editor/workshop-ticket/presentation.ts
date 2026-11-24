import {
  findWorkshopOffer,
  workshopCheckout,
  workshopOffers,
} from '@/lib/commerce/workshop-offers';
import type { SitePage } from '../types';
import type {
  WorkshopTicketChoice,
  WorkshopTicketOption,
  WorkshopTicketPresentation,
} from './types';

const amount = (value: number) => new Intl.NumberFormat('uk-UA').format(value);

async function ticketFor(path: string): Promise<WorkshopTicketPresentation | undefined> {
  const checkout = await workshopCheckout(path);
  if (!checkout?.tickets.length) return;
  const options: WorkshopTicketOption[] = checkout.tickets.map(({ ticket, href }) => ({
    id: ticket.id,
    label: ticket.name,
    description: ticket.description,
    includes: ticket.includes,
    amount: ticket.price,
    price: amount(ticket.price),
    ...(ticket.previousPrice && { previousPrice: amount(ticket.previousPrice) }),
    href: href ?? '',
  }));
  // The first ticket keeps describing single-ticket workshops.
  const [first] = options;
  return { href: first.href, amount: first.amount, price: first.price, currency: 'грн', options };
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
