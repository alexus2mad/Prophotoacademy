import type { Availability } from '../content/types';
export type ProgramPresentation = {
  price?: number;
  open: boolean;
  isCustom: boolean;
  status: Availability;
  inquiryTitle: string;
  buttonLabel: string;
  hasFutureStart: boolean;
};
