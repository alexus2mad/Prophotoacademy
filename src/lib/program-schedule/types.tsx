import type { Offering } from '../content/types';

export type OfferingTime = Pick<Offering, 'startDate' | 'startTime' | 'endTime' | 'timeZone'>;

export type ProgramSchedule = {
  label: string;
  value: string;
  date?: string;
  time?: string;
  status: string;
  explanation?: string;
  inquirySuggested: boolean;
};
