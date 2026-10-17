import type { TeamData } from '@/lib/admin/types';
export type AdminTeamProps = { data: TeamData; demo?: boolean };
export type TeamChange = { email: string; grant: boolean; reason: string };
