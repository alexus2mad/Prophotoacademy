import type { PaymentMode } from '@/lib/commerce/types';
export type CheckoutFormProps = {
  offeringId: string;
  packageId: string;
  mode: PaymentMode;
  email?: string;
  name?: string;
};
export type CheckoutIdentity = { token: string; key: string };
export type CheckoutState = 'idle' | 'sending' | 'error';
