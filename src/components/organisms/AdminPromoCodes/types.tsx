import type { PromoCode } from '@/lib/commerce/types';
export type PromoProgram = { id: string; title: string };
export type AdminPromoCodesProps = {
  codes: PromoCode[];
  programs: PromoProgram[];
  demo?: boolean;
};
export type PromoDraft = {
  code: string;
  percent: string;
  active: boolean;
  starts: string;
  expires: string;
  maxUses: string;
  programIds: string[];
  note: string;
};
export type DeletedPromo = { code: string };
