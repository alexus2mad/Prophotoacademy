'use client';
import Link from 'next/link';
import { LessonMaterial } from '@/components/organisms/LessonMaterial/LessonMaterial';
import type { LessonPreviewProps } from './types';
export function LessonPreview({ course, lesson, sessions, demo }: LessonPreviewProps) {
  return (
    <div className="lesson-app">
      <div className="learning-demo-note">
        Перегляд збереженої чернетки · прогрес не записується
      </div>
      <header className="lesson-header">
        <Link href={(demo ? '/demo' : '') + '/admin/courses/' + course.id}>До редактора</Link>
        <strong>{course.title}</strong>
      </header>
      <main id="main" className="lesson-canvas">
        <div className="lesson-heading">
          <h1>{lesson.title}</h1>
          <p>{lesson.summary}</p>
        </div>
        {lesson.blocks.map((block) => (
          <LessonMaterial
            key={block.id}
            block={block}
            courseId={course.id}
            lessonId={lesson.id}
            sessions={sessions}
            demo={demo}
            preview
            onProgress={() => {}}
          />
        ))}
      </main>
    </div>
  );
}
