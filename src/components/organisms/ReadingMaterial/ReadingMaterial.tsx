'use client';
import { LessonProse } from '@/components/molecules/LessonProse/LessonProse';
import { Expand } from 'lucide-react';
import type { ReadingMaterialProps } from './types';
export function ReadingMaterial(props: ReadingMaterialProps) {
  const { block, url } = props;
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
                <img src={url} alt={block.alt || ''} />
                <span className="lesson-image-open-icon" aria-hidden="true">
                  <Expand size={20} />
                </span>
              </button>
            ) : (
              <img src={url} alt={block.alt || ''} />
            )
          ) : (
            <p className="learning-status">Завантаження зображення…</p>
          )}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      ) : (
        <LessonProse>{block.body || ''}</LessonProse>
      )}
    </section>
  );
}
