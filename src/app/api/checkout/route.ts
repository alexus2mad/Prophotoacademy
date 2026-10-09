import { getContent } from '@/lib/content';
import { checkoutInput, resolvePurchase } from '@/lib/checkout';
import {
  createOrder,
  hash,
  orderByKey,
  IdempotencyConflict,
  purchaseAccess,
} from '@/lib/commerce/orders';
import { guardMutation, jsonBody, errorResponse, HttpError, validationError } from '@/lib/http';
import { purchasePayload } from '@/lib/wayforpay';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    await guardMutation(request, 'checkout');
    const parsed = checkoutInput.safeParse(await jsonBody(request));
    if (!parsed.success)
      throw validationError(parsed.error.issues, {
        name: 'Вкажіть ім’я від 2 до 80 символів.',
        email: 'Вкажіть коректний email.',
        phone: 'Вкажіть коректний телефон.',
        consent: 'Підтвердьте згоду з умовами.',
      });
    const input = parsed.data;
    const { program, pack } = resolvePurchase(
      await getContent(),
      input.offeringId,
      input.packageId,
    );
    const fingerprint = hash(JSON.stringify(input));
    const existing = await orderByKey(input.idempotencyKey);
    if (existing && existing.fingerprint !== fingerprint)
      throw new HttpError(409, 'Цей запит уже використано.');
    const mode = process.env.PAYMENT_MODE || 'mock';
    if (!['mock', 'wayforpay'].includes(mode))
      throw new HttpError(503, 'Платіжний режим не налаштований.');
    const order =
      existing ||
      (await createOrder(
        {
          idempotencyKey: input.idempotencyKey,
          fingerprint,
          acquisition: input.acquisition,
          offeringId: input.offeringId,
          packageId: input.packageId,
          programId: program.id,
          programTitle: program.title,
          packageName: pack.name,
          amount: pack.price,
          currency: 'UAH',
          customer: { name: input.name, email: input.email, phone: input.phone },
          mode: mode as 'mock' | 'wayforpay',
          merchantAccount:
            mode === 'wayforpay' ? process.env.WAYFORPAY_MERCHANT_ACCOUNT : undefined,
          fulfillment:
            mode === 'wayforpay'
              ? await purchaseAccess(input.offeringId, input.packageId)
              : undefined,
        },
        input.token,
      ));
    return Response.json(
      mode === 'mock'
        ? { mode, url: `/thanks?token=${input.token}`, orderId: order.id }
        : {
            mode,
            action: 'https://secure.wayforpay.com/pay',
            fields: purchasePayload(order, input.token),
          },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(
      error instanceof IdempotencyConflict
        ? new HttpError(409, 'Цей запит уже використано.')
        : error,
    );
  }
}
