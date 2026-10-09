import type { Acquisition } from '../attribution/types';
import type { z } from 'zod';
import type { activitySchema } from '../operations';
export type CustomerActivity = z.infer<typeof activitySchema>;
export type Customer = {
  id: string;
  name: string;
  contacts: string[];
  interests: string[];
  marketingUpdates: boolean;
  marketingUpdatedAt?: number;
  locality?: string;
  acquisition?: Acquisition;
  activity: CustomerActivity[];
  inquiries: number;
  lastSeen: string;
};

export type InquiryRecord = { data: string; created_at: number };
