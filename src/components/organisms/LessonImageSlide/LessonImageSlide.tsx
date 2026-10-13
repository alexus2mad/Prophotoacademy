'use client';
import { ImageZoom } from '@/components/molecules/ImageZoom/ImageZoom';
import { useLessonImageSlide } from './hooks';
import type { LessonImageSlideProps } from './types';

export function LessonImageSlide(props: LessonImageSlideProps) {
  const { media, failed, fail, retry } = useLessonImageSlide(props);
  return (
    <section className="lesson-image-slide" aria-label={props.block.alt || 'Фото уроку'}>
      {media.error || failed ? (
        <div className="lesson-image-message">
          <p role="alert">{media.error || 'Не вдалося завантажити фото'}</p>
          <button type="button" className="button button-secondary" onClick={retry}>
            Спробувати знову
          </button>
        </div>
      ) : media.url ? (
        <ImageZoom
          src={media.url}
          alt={props.block.alt || ''}
          onError={fail}
          onNavigate={props.onNavigate}
        />
      ) : (
        <p className="lesson-image-message" role="status">
          Завантаження фото…
        </p>
      )}
    </section>
  );
}
