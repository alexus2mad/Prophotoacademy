'use client';
import { LessonProse } from '@/components/molecules/LessonProse/LessonProse';
import { Expand } from 'lucide-react';
import type { ReadingMaterialProps } from './types';
export function ReadingMaterial(props: ReadingMaterialProps) {
  const { block, url } = props;
  // The viewport gate supplies image URLs; load immediately once it authorizes them.
  return (
    <section
      className={
        'lesson-block ' +
        (block.kind === 'image' ? 'lesson-image' : 'lesson-reading') +
        (block.presentation === 'practice' ? ' lesson-practice' : '')
      }
      aria-label={block.title}
    >
      {block.title && <h2>{block.title}</h2>}
      {block.kind === 'image' ? (
        <figure>
          {url ? (
            props.onOpenImage ? (
              <button
                type="button"
                className="lesson-image-open"
                aria-haspopup="dialog"
                aria-label={`Відкрити фото: ${block.alt || block.title || 'Фото уроку'}`}
                onClick={props.onOpenImage}
              >
                <img
                  src={url}
                  alt={block.alt || ''}
                  width={block.imageWidth}
                  height={block.imageHeight}
                  loading="eager"
                  decoding="async"
                />
                <span className="lesson-image-open-icon" aria-hidden="true">
                  <Expand size={20} />
                </span>
              </button>
            ) : (
              <img
                src={url}
                alt={block.alt || ''}
                width={block.imageWidth}
                height={block.imageHeight}
                loading="eager"
                decoding="async"
              />
            )
          ) : (
            <div
              className="lesson-image-placeholder"
              style={{ aspectRatio: `${block.imageWidth || 4} / ${block.imageHeight || 3}` }}
              aria-label="Зображення завантажиться під час перегляду"
            />
          )}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      ) : (
        <LessonProse>{block.body || ''}</LessonProse>
      )}
    </section>
  );
}
