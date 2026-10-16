import type { SqlConnection } from '../database/types';
import type { Order } from '../ledger/types';
import type { PaymentEventName } from './types';

// Event names and payload shape follow the original site's Make.com scenario, but every
// field comes from the stored order, so a browser cannot alter what Make receives.
export function paymentEventPayload(
  order: Order,
  event: PaymentEventName,
  extra: Record<string, unknown> = {},
) {
  const productName = `${order.programTitle} — ${order.packageName}`;
  const listAmount = order.listAmount ?? order.amount;
  return {
    event,
    ts: new Date().toISOString(),
    site: process.env.WAYFORPAY_MERCHANT_DOMAIN || '',
    mode: order.mode,
    orderReference: order.id,
    amount: order.amount,
    currency: order.currency,
    email: order.customer.email,
    phone: order.customer.phone,
    productName,
    formData: {
      name: order.customer.name,
      phone: order.customer.phone,
      telegram: order.customer.telegram || '',
      instagram: order.customer.instagram || '',
      promocode: order.promoCode || '',
      email: order.customer.email,
    },
    productData: {
      name: productName,
      id: order.packageId,
      type: order.productKind === 'product' ? 'ticket' : 'course',
      price: `${order.amount} грн`,
      originalPrice: `${listAmount} грн`,
      amount: String(order.amount),
      discountApplied: Boolean(order.promoCode),
      discountPercent: order.discountPercent || 0,
    },
    ...extra,
  };
}

// One delivery per order and event; repeated callbacks or clicks are ignored.
export async function queuePaymentEvent(
  db: SqlConnection,
  order: Order,
  event: PaymentEventName,
  extra?: Record<string, unknown>,
) {
  await db.query(
    "INSERT INTO academy.outbox(id,kind,data) VALUES($1,'payment-event',$2) ON CONFLICT DO NOTHING",
    [`${order.id}:${event}`, JSON.stringify(paymentEventPayload(order, event, extra))],
  );
}
