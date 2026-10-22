'use client';
import { Photo } from '@/components/atoms/Photo/Photo';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePhotoStack } from './hooks';
import type { PhotoStackProps } from './types';

export function PhotoStack({ images, label, sizes }: PhotoStackProps) {
  const { index, move, start, finish, cancel } = usePhotoStack(images.length);
  if (!images.length) return null;
  return (
    <div
      className="photo-stack"
      role="region"
      aria-roledescription="карусель"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div
        className="photo-stack-stage"
        onPointerDown={(event) => {
          if (event.isPrimary) start(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => finish(event.clientX, event.clientY)}
        onPointerCancel={cancel}
        onPointerLeave={cancel}
        onDragStart={(event) => event.preventDefault()}
      >
        {images.map((image, i) => {
          const depth = (i - index + images.length) % images.length;
          return (
            <div
              className="photo-stack-print"
              data-depth={depth}
              key={image.id}
              role="group"
              aria-roledescription="слайд"
              aria-label={i + 1 + ' з ' + images.length}
              aria-hidden={depth !== 0}
            >
              <div className="photo-stack-image">
                <Photo image={image} priority={i === 0} sizes={sizes} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="photo-stack-footer">
        <p className="photo-stack-credit" aria-live="polite" aria-atomic="true">
          {images[index].credit}
          <span className="sr-only">
            . Фото {index + 1} з {images.length}
          </span>
        </p>
        {images.length > 1 && (
          <div className="photo-stack-controls">
            <button
              type="button"
              className="icon-button"
              onClick={() => move(-1)}
              aria-label="Попереднє фото"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <span aria-hidden="true">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              className="icon-button"
              onClick={() => move(1)}
              aria-label="Наступне фото"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
