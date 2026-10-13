'use client';
import { lessonChapters } from '@/lib/learning/presentation';
import { useSelectedChapter } from './hooks';
import type { LessonChaptersProps } from './types';

export function LessonChapters({ lesson, onNavigate }: LessonChaptersProps) {
  const selectedHash = useSelectedChapter(lesson.id);
  const chapters = lessonChapters(lesson);
  if (!chapters.length) return null;
  return (
    <nav className="lesson-chapters" aria-label={`Розділи уроку: ${lesson.title}`}>
      <ol>
        {chapters.map((chapter) => {
          const href = '#material-' + chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={href}
                aria-current={selectedHash === href ? 'location' : undefined}
                onClick={onNavigate}
              >
                {chapter.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
