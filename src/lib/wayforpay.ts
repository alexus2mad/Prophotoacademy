import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { HttpError } from './http';
import type { Order } from './ledger/types';
import type { OrderStatus } from './ledger/types';
export const sign = (parts: (string | number)[], secret: string) =>
  createHmac('md5', secret).update(parts.join(';')).digest('hex');
export const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
const config = () => {
  const merchant = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
  const secret = process.env.WAYFORPAY_MERCHANT_SECRET;
  const domain = process.env.WAYFORPAY_MERCHANT_DOMAIN;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!merchant || !secret || !domain || !site || !site.startsWith('https://'))
    throw new HttpError(503, 'Платіжну систему ще не підключено.');
  return { merchant, secret, domain, site };
};
export function purchasePayload(order: Order, token: string) {
  const { merchant, secret, domain, site } = config();
  const productName = `${order.programTitle} — ${order.packageName}`;
  return {
    merchantAccount: merchant,
    merchantDomainName: domain,
    merchantAuthType: 'SimpleSignature',
    merchantSignature: sign(
      [
        merchant,
        domain,
        order.id,
        order.createdAt,
        order.amount,
        order.currency,
        productName,
        1,
        order.amount,
      ],
      secret,
    ),
    orderReference: order.id,
    orderDate: order.createdAt,
    amount: order.amount,
    currency: order.currency,
    productName: [productName],
    productCount: [1],
    productPrice: [order.amount],
    clientFirstName: order.customer.name,
    clientEmail: order.customer.email,
    clientPhone: order.customer.phone,
    language: 'UA',
    serviceUrl: `${site}/api/payments/wayforpay/callback`,
    returnUrl: `${site}/thanks?token=${token}`,
  };
}
export const callbackInput = z.object({
  merchantAccount: z.string().max(100),
  orderReference: z.string().max(100),
  amount: z.union([z.number(), z.string()]),
  currency: z.string().max(8),
  authCode: z.union([z.string(), z.number()]).optional().default(''),
  cardPan: z.string().optional().default(''),
  transactionStatus: z.string().max(40),
  reasonCode: z.union([z.string(), z.number()]),
  merchantSignature: z.string().regex(/^[a-fA-F0-9]{32}$/),
  refundAmount: z.union([z.number(), z.string()]).optional(),
});
export function verifyCallback(
  raw: unknown,
  order: Order,
  merchant: string,
  secret: string,
): OrderStatus {
  const parsed = callbackInput.safeParse(raw);
  if (!parsed.success) throw new HttpError(400, 'Invalid callback');
  const data = parsed.data;
  const signature = sign(
    [
      data.merchantAccount,
      data.orderReference,
      data.amount,
      data.currency,
      data.authCode,
      data.cardPan,
      data.transactionStatus,
      data.reasonCode,
    ],
    secret,
  );
  if (!safeEqual(signature, data.merchantSignature.toLowerCase()))
    throw new HttpError(401, 'Invalid signature');
  if (
    order.mode !== 'wayforpay' ||
    data.merchantAccount !== merchant ||
    data.orderReference !== order.id ||
    Number(data.amount) !== order.amount ||
    data.currency !== order.currency
  )
    throw new HttpError(400, 'Order mismatch');
  const statuses: Record<string, OrderStatus> = {
    Approved: 'approved',
    Pending: 'pending',
    InProcessing: 'pending',
    WaitingAuthComplete: 'pending',
    Declined: 'declined',
    Expired: 'canceled',
    Voided: 'canceled',
    Refunded: 'refunded',
    RefundInProcessing: 'approved',
  };
  if (!statuses[data.transactionStatus]) throw new HttpError(400, 'Unknown transaction status');
  return statuses[data.transactionStatus];
}
// Only check the Academy order being fulfilled. Merchant-wide imports, financial
// reports and refund submission are owned by ps-booking.
export async function confirmedOrderStatus(
  raw: unknown,
  order: Order,
  merchant: string,
  secret: string,
): Promise<OrderStatus> {
  const status = verifyCallback(raw, order, merchant, secret);
  if (status !== 'refunded') return status;
  const response = await fetch('https://api.wayforpay.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      transactionType: 'CHECK_STATUS',
      merchantAccount: merchant,
      orderReference: order.id,
      merchantSignature: sign([merchant, order.id], secret),
      apiVersion: 1,
    }),
  });
  if (!response.ok) throw new HttpError(502, 'Payment confirmation unavailable');
  const checked = callbackInput.parse(await response.json());
  const confirmed = verifyCallback(checked, order, merchant, secret);
  if (confirmed !== 'refunded') return confirmed;
  // Ambiguous provider responses are retried, never interpreted as a full refund.
  const refunded = Number(checked.refundAmount);
  if (
    checked.refundAmount === undefined ||
    !Number.isFinite(refunded) ||
    refunded < 0 ||
    refunded > order.amount
  )
    throw new HttpError(502, 'Refund amount confirmation unavailable');
  return Math.round(refunded * 100) === Math.round(order.amount * 100) ? 'refunded' : 'approved';
}
export function callbackAck(orderReference: string, secret: string) {
  const time = Math.floor(Date.now() / 1000);
  return {
    orderReference,
    status: 'accept',
    time,
    signature: sign([orderReference, 'accept', time], secret),
  };
}
