'use client';

import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { ImageGalleryDialog } from '@/components/molecules/ImageGalleryDialog/ImageGalleryDialog';
import { useImageGallery } from '@/components/molecules/ImageGalleryDialog/hooks';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import { useStudioGallery } from './hooks';
import type { StudioSpacesGalleryProps } from './types';
import styles from './StudioSpacesGallery.module.css';

export function StudioSpacesGallery({ images, label, variant = 'room' }: StudioSpacesGalleryProps) {
  const artworks = variant === 'artworks';
  const { track, position, move, onKeyDown } = useStudioGallery(images.length, artworks);
  const gallery = useImageGallery(images.length);
  const galleryImages = images.map(({ asset, alt }) => ({
    ...asset,
    id: asset.src,
    src: studioAssetUrl(asset.src),
    alt,
    title: alt,
  }));
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
        {images.map(({ asset, alt }, index) =>
          artworks ? (
            <button
              type="button"
              key={asset.src}
              className={`${styles.image} ${styles.trigger}`}
              aria-label={`Відкрити роботу: ${alt}`}
              aria-haspopup="dialog"
              onClick={() => gallery.open(index)}
            >
              <StudioImage
                asset={asset}
                alt={alt}
                fit="cover"
                sizes="(max-width: 760px) 86vw, 41vw"
              />
            </button>
          ) : (
            <StudioImage
              key={asset.src}
              asset={asset}
              alt={alt}
              fit="cover"
              className={styles.image}
              sizes="(max-width: 760px) 86vw, 40vw"
            />
          ),
        )}
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
      {artworks && (
        <ImageGalleryDialog
          images={galleryImages}
          dialogRef={gallery.dialog}
          index={gallery.index}
          onNavigate={gallery.move}
          label={label}
        />
      )}
    </div>
  );
}
