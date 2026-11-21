import { Photo } from '@/components/atoms/Photo/Photo';
import { Maximize2 } from 'lucide-react';
import type { WorkCardProps } from './types';
export function WorkCard({ work, image: img, onOpen }: WorkCardProps) {
  return (
    <figure className="work-item" data-site-section={'work-' + work.id} data-card-motion>
      <button
        type="button"
        onClick={() => onOpen()}
        className="work-image"
        data-card-photo
        aria-label={`Відкрити роботу: ${work.title}`}
        aria-haspopup="dialog"
      >
        <Photo image={img} sizes="(max-width: 760px) 40vw, (max-width: 1023px) 44vw, 30vw" />
        <span className="work-open" aria-hidden="true">
          <Maximize2 size={16} />
        </span>
      </button>
      <figcaption>
        <span data-site-field="title">{work.title}</span>
        <span data-site-locked="">{work.device === 'phone' ? 'На телефон' : 'На камеру'}</span>
      </figcaption>
    </figure>
  );
}
