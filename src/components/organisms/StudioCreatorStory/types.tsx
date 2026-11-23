import type { Program } from '@/lib/content/types';
import type { ReactNode } from 'react';
import type { StudioCourseEditorial } from '@/lib/studio-creator/types';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
export type StudioCreatorStoryProps = BrandContentProps & {
  beforeCurriculum?: ReactNode;
  program: Program;
  duration: string;
  editorial: Pick<StudioCourseEditorial, 'audience' | 'benefits' | 'learningSteps'>;
};
