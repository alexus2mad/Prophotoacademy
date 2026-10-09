import type { EnrollmentCardView, LiveSession } from '@/lib/learning/types';
export type StudentOverviewProps = {
  name: string;
  courses: EnrollmentCardView[];
  nextSession?: LiveSession;
  demo?: boolean;
};
