import { enrollmentOptions } from './catalog';
import type { WorkshopOffer } from './types';

// Commercial terms for editor-created workshops. The editor owns the landing and
// may bind this offer; its content never provides the amount for an order.
export const workshopOffers: WorkshopOffer[] = [
  {
    path: '/flash-without-fear',
    program: {
      id: 'program-flash-without-fear',
      title: 'Flash without fear',
      shortTitle: 'Flash without fear',
      category: 'class',
      image: {
        src: '/images/workshops/flash-without-fear.webp',
        alt: 'Студійний портрет з інтенсиву Flash without fear',
        width: 480,
        height: 720,
      },
    },
    offering: {
      id: 'offering-flash-without-fear',
      programId: 'program-flash-without-fear',
      format: 'hybrid',
      duration: '6 годин',
      availability: 'open',
      verificationRequired: false,
      // Prices confirmed by the owner on 24 November 2026; previous prices are display only.
      packages: [
        {
          // The original single-ticket ID is kept for the offline format.
          id: 'flash-without-fear-ticket',
          name: 'Офлайн',
          kind: 'product',
          price: 3700,
          previousPrice: 4200,
          availability: 'open',
          description: 'Участь у студії: практика зі світлом на моделях',
          includes: ['13 грудня, 11:00 – 17:00', 'Київ, вул. Саксаганського, 24/25'],
        },
        {
          id: 'flash-without-fear-online',
          name: 'Онлайн',
          kind: 'product',
          price: 2500,
          previousPrice: 3000,
          availability: 'open',
          description: 'Онлайн-участь у прямому ефірі',
          includes: ['13 грудня, 11:00 – 17:00 за київським часом'],
        },
      ],
    },
  },
];

export const findWorkshopOffer = (path: string) =>
  workshopOffers.find((entry) => entry.path === path);

export const findWorkshopOfferById = (offeringId: string) =>
  workshopOffers.find(({ offering }) => offering.id === offeringId);

/** Each ticket of an editor workshop with its checkout address when it is on sale. */
export async function workshopCheckout(path: string) {
  const workshop = findWorkshopOffer(path);
  if (!workshop) return;
  const { offering } = workshop;
  const { mode, packageIds } = await enrollmentOptions(offering);
  return {
    mode,
    tickets: offering.packages.map((ticket) => ({
      ticket,
      href: packageIds.includes(ticket.id)
        ? '/checkout?' + new URLSearchParams({ offering: offering.id, package: ticket.id })
        : undefined,
    })),
  };
}
