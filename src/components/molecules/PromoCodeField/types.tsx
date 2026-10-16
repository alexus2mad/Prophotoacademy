import type { PromoQuote } from '@/lib/commerce/types';
export type PromoCodeFieldProps = {
  value: string;
  quote?: PromoQuote;
  error?: string;
  checking: boolean;
  onChange: (value: string) => void;
  onApply: () => void;
};
