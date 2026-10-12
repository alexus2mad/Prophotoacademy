'use client';
import { LessonProse } from '@/components/molecules/LessonProse/LessonProse';
import { useReadingMaterial } from './hooks';
import { blockFraction } from '@/lib/learning/progress';
import type { ReadingMaterialProps } from './types';
export function ReadingMaterial(props: ReadingMaterialProps) {
  const { block, url } = props;
  const ref = useReadingMaterial(props);
  return (
    <section
      ref={ref}
      data-reading-block
      data-reading-complete={blockFraction(block, props.state) >= 1}
      className={
        'lesson-block ' +
        (block.kind === 'image' ? 'lesson-image' : 'lesson-reading') +
        (block.presentation === 'practice' ? ' lesson-practice' : '')
      }
      aria-label={block.title}
    >
      {!block.required && block.presentation !== 'practice' && (
        <p className="learning-meta">Додатковий матеріал</p>
      )}
      {block.title && <h2>{block.title}</h2>}
      {block.kind === 'image' ? (
        <figure>
          {url ? (
            <img src={url} alt={block.alt || ''} />
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
