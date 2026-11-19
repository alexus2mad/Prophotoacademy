import type { Program } from '@/lib/content/types';
import type { StudioCourseEditorial } from '@/lib/studio-creator/types';
export type StudioCreatorStoryProps = {
  program: Program;
  duration: string;
  editorial: Pick<StudioCourseEditorial, 'audience' | 'benefits' | 'learningSteps'>;
};
