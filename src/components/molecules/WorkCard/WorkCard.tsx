import { Photo } from '@/components/atoms/Photo/Photo';
import { Maximize2 } from 'lucide-react';
import type { WorkCardProps } from './types';
export function WorkCard({ work, image: img, onOpen }: WorkCardProps) {
  return (
    <figure className="work-item">
      <button
        onClick={() => onOpen()}
        className="work-image"
        aria-label={`Відкрити роботу: ${work.title}`}
      >
        <Photo image={img} sizes="(max-width: 767px) 87vw, (max-width: 1199px) 43vw, 29vw" />
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
