'use client';

import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { useStudioGallery } from './hooks';
import type { StudioSpacesGalleryProps } from './types';
import styles from './StudioSpacesGallery.module.css';

export function StudioSpacesGallery({ images, label, variant = 'room' }: StudioSpacesGalleryProps) {
  const { track, position, move, onKeyDown } = useStudioGallery(images.length);
  return (
    <div className={`${styles.gallery} ${variant === 'artworks' ? styles.artworks : styles.room}`}>
      <div
        className={styles.track}
        ref={track}
        tabIndex={0}
        role="region"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {images.map(({ asset, alt }) => (
          <StudioImage
            key={asset.src}
            asset={asset}
            alt={alt}
            fit="cover"
            className={styles.image}
            sizes={
              variant === 'room' ? '(max-width: 700px) 90vw, 40vw' : '(max-width: 700px) 86vw, 41vw'
            }
          />
        ))}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          aria-label="Попереднє фото"
          disabled={position.start}
          onClick={() => move(-1)}
        >
          ←
        </button>
        <span aria-live="polite">
          {position.index} / {images.length}
        </span>
        <button
          type="button"
          aria-label="Наступне фото"
          disabled={position.end}
          onClick={() => move(1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
