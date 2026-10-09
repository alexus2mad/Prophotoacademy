'use client';
import ReactMarkdown from 'react-markdown';
import { useReadingMaterial } from './hooks';
import type { ReadingMaterialProps } from './types';
export function ReadingMaterial(props: ReadingMaterialProps) {
  const { block, url } = props;
  const ref = useReadingMaterial(props);
  return (
    <section
      ref={ref}
      data-reading-block
      className={'lesson-block ' + (block.kind === 'image' ? 'lesson-image' : 'lesson-reading')}
      aria-label={block.title}
    >
      {!block.required && <p className="learning-meta">Додатковий матеріал</p>}
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
        <div className="lesson-prose">
          <ReactMarkdown skipHtml disallowedElements={['img']}>
            {block.body || ''}
          </ReactMarkdown>
        </div>
      )}
    </section>
  );
}
