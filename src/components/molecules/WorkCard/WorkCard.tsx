import { Photo } from '@/components/atoms/Photo/Photo';
import { Maximize2 } from 'lucide-react';
import type { WorkCardProps } from './types';
export function WorkCard({ work, image: img, onOpen }: WorkCardProps) {
  return (
    <figure className="work-item" data-card-motion>
      <button
        type="button"
        onClick={() => onOpen()}
        className="work-image"
        data-card-photo
        aria-label={`Відкрити роботу: ${work.title}`}
      >
        <Photo
          image={img}
          sizes="(max-width: 599px) calc(100vw - 40px), (max-width: 1023px) 44vw, 30vw"
        />
        <span className="work-open" aria-hidden="true">
          <Maximize2 size={16} />
        </span>
      </button>
      <figcaption>
        <span>{work.title}</span>
        <span>{work.device === 'phone' ? 'На телефон' : 'На камеру'}</span>
      </figcaption>
    </figure>
  );
}
