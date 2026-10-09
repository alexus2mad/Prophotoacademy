'use client';
import { ReadingMaterial } from '@/components/organisms/ReadingMaterial/ReadingMaterial';
import { LearningVideo } from '@/components/organisms/LearningVideo/LearningVideo';
import { LearningPdf } from '@/components/organisms/LearningPdf/LearningPdf';
import { ZoomLesson } from '@/components/organisms/ZoomLesson/ZoomLesson';
import { useLessonMedia } from './hooks';
import type { LessonMaterialProps } from './types';
export function LessonMaterial(props: LessonMaterialProps) {
  const { media, retry } = useLessonMedia(props),
    { block, sessions, lessonId, demo } = props;
  if (media.error)
    return (
      <div className="lesson-block">
        <p className="learning-error" role="alert">
          {media.error}
        </p>
        <button className="button button-secondary" type="button" onClick={retry}>
          Спробувати знову
        </button>
      </div>
    );
  if (block.kind === 'article' || block.kind === 'image')
    return <ReadingMaterial {...props} url={media.url} />;
  if (block.kind === 'video') return <LearningVideo {...props} media={media} />;
  if (block.kind === 'pdf')
    return media.url ? (
      <LearningPdf {...props} url={media.url} />
    ) : (
      <p className="pdf-loading">Завантаження PDF…</p>
    );
  if (block.kind === 'zoom')
    return (
      <>
        <ZoomLesson session={sessions.find((s) => s.lesson_id === lessonId)} demo={demo} />
        {block.mediaId && <LearningVideo {...props} media={media} />}
      </>
    );
  return (
    <section className="lesson-block lesson-file">
      <h2>{block.title}</h2>
      {media.url ? (
        <a
          className="button button-secondary"
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Завантажити матеріал
        </a>
      ) : (
        <p className="learning-status">Завантаження…</p>
      )}
    </section>
  );
}
