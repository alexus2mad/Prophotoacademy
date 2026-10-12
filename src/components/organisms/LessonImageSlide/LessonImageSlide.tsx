'use client';
import { ImageZoom } from '@/components/molecules/ImageZoom/ImageZoom';
import { blockFraction } from '@/lib/learning/progress';
import { useLessonImageSlide } from './hooks';
import type { LessonImageSlideProps } from './types';

export function LessonImageSlide(props: LessonImageSlideProps) {
  const { media, reading, failed, fail, retry } = useLessonImageSlide(props);
  return (
    <section
      ref={reading}
      className="lesson-image-slide"
      data-reading-block
      data-reading-complete={blockFraction(props.block, props.state) >= 1}
      aria-label={props.block.alt || 'Фото уроку'}
    >
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
