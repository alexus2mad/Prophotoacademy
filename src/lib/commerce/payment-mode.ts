import { HttpError } from '../http';
import type { PaymentMode } from './types';

// Missing credentials never turn a paid checkout into a free enrollment.
export function paymentMode(): PaymentMode {
  const mode = process.env.PAYMENT_MODE || 'mock';
  if (mode !== 'mock' && mode !== 'disabled' && mode !== 'wayforpay')
    throw new HttpError(503, 'Режим оформлення не налаштований');
  return mode;
}
