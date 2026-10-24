'use client';
import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { usePhotoStack } from './hooks';
import type { PhotoStackProps } from './types';

export function PhotoStack({ images, label, sizes }: PhotoStackProps) {
  const { index, move, start, finish, cancel, activate } = usePhotoStack(images.length);
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
      <button
        type="button"
        className="photo-stack-stage"
        disabled={images.length < 2}
        aria-label={images[index].alt + (images.length > 1 ? '. Наступне фото' : '')}
        onClick={(event) => activate(event.detail)}
        onPointerDown={(event) => {
          if (event.isPrimary && event.button === 0) {
            start(event.clientX, event.clientY);
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }}
        onPointerUp={(event) => {
          if (event.isPrimary) finish(event.clientX, event.clientY);
        }}
        onPointerCancel={cancel}
        onDragStart={(event) => event.preventDefault()}
      >
        {images.map((image, i) => {
          const depth = (i - index + images.length) % images.length;
          return (
            <span
              className="photo-stack-print"
              data-depth={depth}
              key={image.id}
              aria-hidden={depth !== 0}
            >
              <span className="photo-stack-image">
                <PreparedPhoto image={image} priority={i === 0} eager sizes={sizes} />
              </span>
            </span>
          );
        })}
      </button>
      <p className="photo-stack-credit" aria-live="polite" aria-atomic="true">
        {images[index].credit}
        <span className="sr-only">
          . Фото {index + 1} з {images.length}
        </span>
      </p>
    </div>
  );
}
