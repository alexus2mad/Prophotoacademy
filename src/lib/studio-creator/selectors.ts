import type { Program } from '@/lib/content/types';
import { foodEditorial } from '@/lib/studio-food/content';
import { creatorEditorial } from './content';
import type { StudioCourseEditorial } from './types';

const editorials = new Map<string, StudioCourseEditorial>([
  ['program-commercial', creatorEditorial],
  ['program-food', foodEditorial],
]);

/** The editorial for courses presented with the Creator-style course layout. */
export function courseEditorial(program: Program): StudioCourseEditorial | undefined {
  return editorials.get(program.id);
}
