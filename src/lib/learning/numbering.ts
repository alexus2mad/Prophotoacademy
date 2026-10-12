import type { CourseDraft, Lesson } from './types';

export function numberedLessons(course: CourseDraft): Lesson[] {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const reserved = new Set(lessons.flatMap((lesson) => (lesson.number ? [lesson.number] : [])));
  let previous = 0;
  return lessons.map((lesson) => {
    let number = lesson.number;
    if (!number) {
      number = previous + 1;
      while (reserved.has(number)) number++;
      reserved.add(number);
    }
    previous = Math.max(previous, number);
    return { ...lesson, number };
  });
}

export function lessonNumber(course: CourseDraft, lessonId: string) {
  return numberedLessons(course).find((lesson) => lesson.id === lessonId)?.number;
}

export function lessonLabel(course: CourseDraft, lesson: Lesson) {
  const number = lessonNumber(course, lesson.id);
  return number ? `Лекція ${number} — ${lesson.title}` : lesson.title;
}

export function numberCourse(course: CourseDraft): CourseDraft {
  const numbers = new Map(numberedLessons(course).map((lesson) => [lesson.id, lesson.number]));
  return {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({ ...lesson, number: numbers.get(lesson.id) })),
    })),
  };
}
