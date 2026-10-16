import { z } from 'zod';
import { databasePool } from '@/lib/database/client';
import { errorResponse, guardMutation, HttpError, jsonBody } from '@/lib/http';
import { orderByToken } from '@/lib/commerce/orders';
import { queuePaymentEvent } from '@/lib/commerce/payment-events';
export const runtime = 'nodejs';
const widgetEvent = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    event: z.enum(['approved', 'declined', 'pending']),
  })
  .strict();
// Widget outcomes are unverified hints for the academy's Make.com scenario. They never
// change the order or grant access; only the provider callback does that.
export async function POST(request: Request) {
  try {
    await guardMutation(request, 'checkout-event');
    const input = widgetEvent.parse(await jsonBody(request, 1024));
    const order = await orderByToken(input.token);
    if (!order || order.mode !== 'wayforpay') throw new HttpError(404, 'Замовлення не знайдено');
    await queuePaymentEvent(databasePool(), order, `payment_${input.event}`);
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
