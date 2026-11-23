import type { Program } from '@/lib/content/types';
import type { StudioCourseEditorial } from '@/lib/studio-creator/types';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
export type StudioCreatorStoryProps = BrandContentProps & {
  program: Program;
  duration: string;
  editorial: Pick<StudioCourseEditorial, 'audience' | 'benefits' | 'learningSteps'>;
};
