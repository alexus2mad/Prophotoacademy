import Link from 'next/link';
import { Check, Lock, Play } from 'lucide-react';
import { LessonChapters } from '@/components/molecules/LessonChapters/LessonChapters';
import { lessonChapters } from '@/lib/learning/presentation';
import { displayDate } from '@/lib/learning/selectors';
import type { CurriculumLessonProps } from './types';

export function CurriculumLesson({
  lesson,
  label,
  href,
  available,
  complete,
  current,
  currentChapterId,
  onNavigate,
}: CurriculumLessonProps) {
  const content = (
    <>
      <span
        className={'curriculum-state' + (complete ? ' is-complete' : '')}
        aria-label={complete ? 'Завершено' : !available ? 'Заплановано' : 'Не завершено'}
      >
        {complete ? (
          <Check size={12} />
        ) : !available ? (
          <Lock size={10} />
        ) : current ? (
          <Play size={10} />
        ) : null}
      </span>
      <span>
        {label}
        {!available && lesson.releaseAt && <small>З {displayDate(lesson.releaseAt)}</small>}
      </span>
    </>
  );

  if (current && available && lessonChapters(lesson).length) {
    return (
      <details className="curriculum-lecture">
        <summary className="curriculum-lesson" aria-current="page">
          {content}
        </summary>
        <LessonChapters
          lesson={lesson}
          currentChapterId={currentChapterId}
          onNavigate={onNavigate}
        />
      </details>
    );
  }

  return (
    <Link
      className="curriculum-lesson"
      href={available ? href : '#'}
      aria-current={current ? 'page' : undefined}
      aria-disabled={!available}
      onClick={(event) => {
        if (!available) event.preventDefault();
        else onNavigate?.();
      }}
    >
      {content}
    </Link>
  );
}
