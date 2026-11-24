import { z } from 'zod';
import { acquisitionSchema } from '@/lib/acquisition-schema';
import { hostedWorkshopDestination } from '@/lib/commerce/hosted-workshop';
import { createOrder, hash, IdempotencyConflict } from '@/lib/commerce/orders';
import { paymentMode } from '@/lib/commerce/payment-mode';
import { findWorkshopOfferById } from '@/lib/commerce/workshop-offers';
import { canEnroll } from '@/lib/format';
import { errorResponse, guardMutation, HttpError, jsonBody } from '@/lib/http';
import { deliverSoon } from '@/lib/notifications/delivery';
import { getPublishedPage } from '@/lib/site-editor/store';
import { paymentConfig } from '@/lib/wayforpay';

export const runtime = 'nodejs';
const requestSchema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    idempotencyKey: z.uuid(),
    acquisition: acquisitionSchema.optional(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    await guardMutation(request, 'workshop-checkout');
    const input = requestSchema.parse(await jsonBody(request));
    const query = new URL(request.url).searchParams;
    const workshop = findWorkshopOfferById(query.get('offering') || '');
    if (!workshop) throw new HttpError(404, 'Воркшоп не знайдено.');
    const { program, offering, path } = workshop;
    const ticket = offering.packages.find((pack) => pack.id === query.get('package'));
    if (!ticket) throw new HttpError(404, 'Квиток не знайдено.');
    const page = await getPublishedPage(path);
    const mode = paymentMode();
    if (
      page?.kind !== 'workshop' ||
      page.offerId !== offering.id ||
      mode === 'disabled' ||
      !canEnroll(offering, ticket)
    )
      throw new HttpError(409, 'Продаж квитків на цей воркшоп наразі недоступний.');
    const merchant = mode === 'wayforpay' ? paymentConfig().merchant : undefined;
    const order = await createOrder(
      {
        idempotencyKey: input.idempotencyKey,
        fingerprint: hash(JSON.stringify(['workshop', offering.id, ticket.id, input.token])),
        offeringId: offering.id,
        packageId: ticket.id,
        packageName: ticket.name,
        programId: program.id,
        programTitle: program.title,
        amount: ticket.price,
        listAmount: ticket.price,
        currency: 'UAH',
        mode,
        hostedTicket: true,
        merchantAccount: merchant,
        acquisition: input.acquisition,
        customer: { name: '', email: '', phone: '' },
        productKind: 'product',
      },
      input.token,
    );
    const url = await hostedWorkshopDestination(order, input.token);
    deliverSoon();
    return Response.json({ mode, url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return errorResponse(
      error instanceof IdempotencyConflict
        ? new HttpError(409, 'Цей запит уже використано.')
        : error,
    );
  }
}
