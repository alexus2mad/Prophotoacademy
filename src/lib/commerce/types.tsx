export type PaymentMode = 'mock' | 'disabled' | 'wayforpay';
export type EnrollmentOptions = {
  mode: PaymentMode;
  packageIds: string[];
  lessonTitles?: Record<string, string[]>;
};
export type PackageIdRow = { package_id: string; lesson_titles: string[] };
export type PromoCode = {
  code: string;
  percent: number;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  maxUses: number | null;
  programIds: string[];
  note: string;
  uses: number;
};
export type PromoCodeRow = {
  code: string;
  percent: number;
  active: boolean;
  starts_at: Date | null;
  expires_at: Date | null;
  max_uses: number | null;
  program_ids: string[];
  note: string;
  uses?: string | number;
};
export type PromoQuote = { code: string; percent: number; amount: number };
export type PromoLookup = { code: string; programId: string; amount: number; email?: string };
export type PaymentEventName =
  | 'payment_start'
  | 'payment_approved'
  | 'payment_declined'
  | 'payment_pending'
  | 'payment_success_server'
  | 'payment_decline_server'
  | 'payment_refund_server';
