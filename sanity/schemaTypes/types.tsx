import type { SanityDocument } from 'sanity';
import type { OfferingTime } from '../../src/lib/program-schedule/types';

export type OfferingScheduleDocument = SanityDocument & OfferingTime;

export type PackageIdentity = { id?: string; featured?: boolean };
