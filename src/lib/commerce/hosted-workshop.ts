import { createHmac } from 'node:crypto';
import { z } from 'zod';
import { HttpError } from '../http';
import type { Order } from '../ledger/types';
import { safeEqual } from '../wayforpay';

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
