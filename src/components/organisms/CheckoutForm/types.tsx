import type { PaymentMode, PromoQuote } from '@/lib/commerce/types';
import type { PackageKind } from '@/lib/content/types';
export type CheckoutFormProps = {
  offeringId: string;
  packageId: string;
  mode: PaymentMode;
  kind?: PackageKind;
  email?: string;
  name?: string;
};
export type CheckoutIdentity = { token: string; key: string };
export type CheckoutState = 'idle' | 'sending' | 'paying' | 'error';
export type PromoState = { value: string; quote?: PromoQuote; error?: string; checking: boolean };
export type PaymentFields = Record<string, string | number | boolean | (string | number)[]>;
export type CheckoutResult = {
  mode: PaymentMode;
  url?: string;
  action?: string;
  fields?: PaymentFields;
  error?: string;
  fieldErrors?: Record<string, string>;
};
export type WidgetCallback = (response: unknown) => void;
export type WayforpayWidget = {
  run: (
    params: PaymentFields,
    approved: WidgetCallback,
    declined: WidgetCallback,
    pending: WidgetCallback,
  ) => void;
};
export type WayforpayWindow = Window & { Wayforpay?: new () => WayforpayWidget };
export type WidgetEvent = 'approved' | 'declined' | 'pending';
