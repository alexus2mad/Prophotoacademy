import type { Member } from '../auth/types';
import type {
  CourseRelease,
  Grant,
  LiveSession,
  ProgressRow,
  LearningMedia,
  PackageRuleInput,
} from '../learning/types';
import type { Offering, Program } from '../content/types';
export type AdminCourse = {
  id: string;
  program_id: string;
  title: string;
  cover: string;
  active_release_id: string | null;
  created_at: string;
};
export type AdminPerson = Member & { course_count: number };
export type AdminOverviewData = {
  courses: number;
  students: number;
  activeGrants: number;
  unpublished: number;
  failedMedia: number;
  pendingEmails: number;
  sessions: LiveSession[];
  courseStats?: CourseStatistics[];
};
export type CourseEditorData = {
  releases: CourseRelease[];
  offerings: Offering[];
  rules: PackageRuleInput[];
  media: LearningMedia[];
  sessions: LiveSession[];
};
export type AdminCoursesData = {
  courses: AdminCourse[];
  programs: Pick<Program, 'id' | 'title'>[];
};
export type TeamData = { members: Member[]; invitations: { email: string; created_at: string }[] };
export type UserDetail = {
  profile: AdminPerson | null;
  email: string;
  grants: Grant[];
  progress: ProgressRow[];
  courses: CourseRelease[];
  purchases: PurchaseView[];
  learning?: GrantStatistics[];
};
export type PurchaseView = {
  id: string;
  title: string;
  packageName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};
export type ServiceStatus = { name: string; configured: boolean; detail: string };
export type AdminMutationReply = { ok?: boolean; result?: unknown; error?: string };
export type AdminReply<T> = { ok?: boolean; result: T; error?: string };
export type ManagementMember = Member & { session_verified_at: string };
export type CustomerAcademyAccount = {
  userId: string | null;
  email: string;
  hasAccount: boolean;
  courses: {
    id: string;
    title: string;
    access: { packageName: string; startsAt: string; expiresAt: string | null }[];
  }[];
};
export type CustomerAccessRow = Pick<
  Grant,
  'id' | 'user_id' | 'email' | 'course_id' | 'package_name' | 'starts_at' | 'expires_at'
> & { title: string };
export type GrantStatistics = {
  grantId: string;
  progress: number;
  total: number;
  completed: number;
  lessons: { id: string; title: string; progress: number; source: string | null }[];
};
export type CourseStatistics = {
  id: string;
  title: string;
  students: number;
  completed: number;
  progress: number;
};
