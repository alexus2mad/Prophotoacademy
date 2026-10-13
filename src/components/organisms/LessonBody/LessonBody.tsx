'use client';
import { LessonMaterial } from '@/components/organisms/LessonMaterial/LessonMaterial';
import { LessonImageViewer } from '@/components/organisms/LessonImageViewer/LessonImageViewer';
import { useLessonImages } from './hooks';
import { lessonBlockGroups, lessonChapters } from '@/lib/learning/presentation';
import { readingFont } from '@/lib/typography/fonts';
import type { LessonBodyProps } from './types';

export function LessonBody({
  lesson,
  courseId,
  number,
  moduleTitle,
  progress,
  sessions,
  demo,
  preview,
  onProgress,
  progressError,
}: LessonBodyProps) {
  const { images, selectedIndex, openImage, closeImages } = useLessonImages({ lesson });
  const outline = preview ? lessonChapters(lesson) : [];
  return (
    <div className={`${readingFont.variable} lesson-content`}>
      <div className="lesson-heading">
        {moduleTitle && <p className="learning-meta">{moduleTitle}</p>}
        <h1>{number ? `Лекція ${number} — ${lesson.title}` : lesson.title}</h1>
        <p>{lesson.summary}</p>
      </div>
      {outline.length > 3 && (
        <details className="lesson-outline">
          <summary>{number ? `Коротко про лекцію ${number}` : 'У цьому уроці'}</summary>
          <nav aria-label="Розділи уроку">
            {outline.map((b) => (
              <a key={b.id} href={'#material-' + b.id}>
                {b.title}
              </a>
            ))}
          </nav>
        </details>
      )}
      {lessonBlockGroups(lesson.blocks).map((group) => (
        <div
          key={group[0].id}
          className={group.length > 1 ? 'lesson-image-pair' : 'lesson-material-group'}
        >
          {group.map((block) => (
            <div
              key={block.id}
              id={'material-' + block.id}
              className="lesson-material-anchor"
              tabIndex={-1}
            >
              <LessonMaterial
                block={block}
                courseId={courseId}
                lessonId={lesson.id}
                state={progress?.blocks[block.id]}
                sessions={sessions}
                demo={demo}
                preview={preview}
                onProgress={onProgress}
                progressError={progressError}
                onOpenImage={() => openImage(block.id)}
              />
            </div>
          ))}
        </div>
      ))}
      {selectedIndex >= 0 && (
        <LessonImageViewer
          key={lesson.id}
          images={images}
          initialIndex={selectedIndex}
          courseId={courseId}
          lessonId={lesson.id}
          progress={progress}
          demo={demo}
          preview={preview}
          onProgress={onProgress}
          onClose={closeImages}
        />
      )}
    </div>
  );
}
