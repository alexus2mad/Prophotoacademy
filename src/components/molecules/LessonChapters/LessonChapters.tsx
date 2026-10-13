'use client';
import { lessonChapters } from '@/lib/learning/presentation';
import { useChapterReveal } from './hooks';
import type { LessonChaptersProps } from './types';

export function LessonChapters({ lesson, currentChapterId, onNavigate }: LessonChaptersProps) {
  const navigation = useChapterReveal(currentChapterId);
  const chapters = lessonChapters(lesson);
  const currentIndex = chapters.findIndex((chapter) => chapter.id === currentChapterId);
  if (!chapters.length) return null;
  return (
    <nav ref={navigation} className="lesson-chapters" aria-label={`Розділи уроку: ${lesson.title}`}>
      <ol>
        {chapters.map((chapter, index) => {
          const href = '#material-' + chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={href}
                className={index < currentIndex ? 'is-past' : undefined}
                aria-current={chapter.id === currentChapterId ? 'location' : undefined}
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
