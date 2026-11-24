import { createHmac } from 'node:crypto';
import { z } from 'zod';
import { transaction } from '../database/client';
import type { JsonRow } from '../database/types';
import { HttpError } from '../http';
import type { Order } from '../ledger/types';
import { paymentConfig, purchasePayload, safeEqual } from '../wayforpay';

// Only the merchant and WayForPay receive this URL. Contact fields aren't
// included in the provider's transaction HMAC; verify their delivery separately.
function contactProof(reference: string, secret: string) {
  return createHmac('sha256', secret)
    .update('workshop-contact:' + reference)
    .digest('hex');
}

export function hostedTicketContact(
  callbackUrl: URL,
  order: Order,
  secret: string,
  email: unknown,
  phone: unknown,
) {
  if (!order.hostedTicket) return;
  const proof = callbackUrl.searchParams.get('receipt') || '';
  if (!safeEqual(proof, contactProof(order.id, secret)))
    throw new HttpError(401, 'Invalid provider contact callback');
  const parsedEmail = z.string().trim().toLowerCase().pipe(z.email().max(160)).safeParse(email);
  const parsedPhone = z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{6,24}$/)
    .safeParse(phone);
  return {
    email: parsedEmail.success ? parsedEmail.data : '',
    phone: parsedPhone.success ? parsedPhone.data : '',
  };
}

async function startHostedPayment(order: Order, token: string) {
  const { secret } = paymentConfig();
  const fields = purchasePayload(order, token);
  const callback = new URL(fields.serviceUrl);
  callback.searchParams.set('receipt', contactProof(order.id, secret));
  const returned = new URL(fields.returnUrl);
  returned.pathname = '/api/payments/wayforpay/return';
  const form = new URLSearchParams();
  for (const [name, value] of Object.entries({
    ...fields,
    serviceUrl: callback.href,
    returnUrl: returned.href,
  })) {
    if (name.startsWith('client') || name === 'authorizationType') continue;
    if (Array.isArray(value)) {
      for (const item of value) form.append(name + '[]', String(item));
    } else form.append(name, String(value));
  }
  const unavailable = new HttpError(502, 'Не вдалося відкрити WayForPay. Спробуйте ще раз.');
  try {
    const response = await fetch('https://secure.wayforpay.com/pay?behavior=offline', {
      method: 'POST',
      body: form,
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (response.ok) {
      const data = await response.json();
      const url = new URL(data.url);
      if (url.origin === 'https://secure.wayforpay.com' && !url.username && !url.password)
        return url.href;
    }
  } catch {}
  throw unavailable;
}

export async function hostedWorkshopDestination(order: Order, token: string) {
  const statusUrl = '/thanks?' + new URLSearchParams({ token });
  if (order.mode === 'mock' || order.status !== 'pending') return statusUrl;
  return transaction(async (db) => {
    // Two taps (or a response lost on the way to the browser) reuse one
    // provider session. A provider timeout never creates a new order reference.
    const locked = (
      await db.query<JsonRow<Order>>('SELECT data FROM academy.orders WHERE id=$1 FOR UPDATE', [
        order.id,
      ])
    ).rows[0].data;
    if (locked.status !== 'pending') return statusUrl;
    if (locked.hostedPaymentUrl) return locked.hostedPaymentUrl;
    locked.hostedPaymentUrl = await startHostedPayment(locked, token);
    await db.query('UPDATE academy.orders SET data=$1 WHERE id=$2', [
      JSON.stringify(locked),
      locked.id,
    ]);
    return locked.hostedPaymentUrl;
  });
}
