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
      format: 'offline',
      duration: '6 годин',
      availability: 'open',
      verificationRequired: false,
      packages: [
        {
          id: 'flash-without-fear-ticket',
          name: 'Квиток на інтенсив',
          kind: 'product',
          price: 4200,
          availability: 'open',
          description: '6-годинний практичний інтенсив зі студійного світла',
          includes: [],
        },
      ],
    },
  },
];

export const findWorkshopOffer = (path: string) =>
  workshopOffers.find((entry) => entry.path === path);

export const findWorkshopOfferById = (offeringId: string) =>
  workshopOffers.find(({ offering }) => offering.id === offeringId);

export async function workshopCheckout(path: string) {
  const workshop = findWorkshopOffer(path);
  if (!workshop) return;
  const { offering } = workshop;
  const [ticket] = offering.packages;
  const { mode, packageIds } = await enrollmentOptions(offering);
  return {
    price: ticket.price,
    mode,
    href: packageIds.includes(ticket.id)
      ? '/api/checkout/workshop?' +
        new URLSearchParams({ offering: offering.id, package: ticket.id })
      : undefined,
  };
}
