import type { Program } from '@/lib/content/types';
import { creatorEditorial } from './content';
import type { StudioCourseEditorial } from './types';

const editorials = new Map<string, StudioCourseEditorial>([
  ['program-commercial', creatorEditorial],
]);

/** The editorial for courses presented with the Creator-style course layout. */
export function courseEditorial(program: Program): StudioCourseEditorial | undefined {
  return editorials.get(program.id);
}
