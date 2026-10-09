import type { AcademyContent, Program } from '@/lib/content/types';
export type CourseSelectionProps = {
  primary?: Program;
  courses: Program[];
  content: Pick<AcademyContent, 'images' | 'offerings'>;
};
