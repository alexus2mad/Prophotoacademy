import type { RosterPerson } from '@/lib/admin/types';
export type SessionRosterProps = {
  sessionId: string;
  title: string;
  demo?: boolean;
  demoPeople?: RosterPerson[];
};
export type RosterReply = { people: RosterPerson[]; error?: string };
