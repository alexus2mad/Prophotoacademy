import type { AdminOverviewData, AdminPerson, RosterPerson } from '@/lib/admin/types';
export type AdminStudentsProps = {
  overview: AdminOverviewData;
  people: AdminPerson[];
  query: string;
  demo?: boolean;
  demoRoster?: RosterPerson[];
};
