'use client';
import { lessonNumber } from '@/lib/learning/numbering';
import Link from 'next/link';
import { LessonBody } from '@/components/organisms/LessonBody/LessonBody';
import type { LessonPreviewProps } from './types';
export function LessonPreview({ course, lesson, sessions, demo }: LessonPreviewProps) {
  return (
    <div className="lesson-app">
      <div className="learning-demo-note">
        Перегляд збереженої чернетки · прогрес не записується
      </div>
      <header className="lesson-header">
        <Link
          className="lesson-preview-back"
          href={(demo ? '/demo' : '') + '/admin/courses/' + course.id}
        >
          До редактора
        </Link>
        <strong>{course.title}</strong>
      </header>
      <main id="main" className="lesson-canvas">
        <LessonBody
          lesson={lesson}
          number={lessonNumber(course, lesson.id)}
          courseId={course.id}
          sessions={sessions}
          demo={demo}
          moduleTitle={course.modules.find((m) => m.lessons.some((l) => l.id === lesson.id))?.title}
          preview
          onProgress={() => {}}
        />
      </main>
    </div>
  );
}
