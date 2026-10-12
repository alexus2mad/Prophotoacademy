import { HttpError } from '../http';
import { numberCourse } from './numbering';
import type { CourseDraft } from './types';

export function publicationDraft(draft: CourseDraft, lessonIds?: string[]): CourseDraft {
  if (lessonIds === undefined) return numberCourse(structuredClone(draft));
  const known = new Set(
    draft.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)),
  );
  if (
    !lessonIds.length ||
    new Set(lessonIds).size !== lessonIds.length ||
    lessonIds.some((id) => !known.has(id))
  )
    throw new HttpError(400, 'Оберіть наявні уроки для публікації');
  const selected = new Set(lessonIds);
  const result = numberCourse(structuredClone(draft));
  result.modules = result.modules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => selected.has(lesson.id)),
    }))
    .filter((module) => module.lessons.length);
  return result;
}
