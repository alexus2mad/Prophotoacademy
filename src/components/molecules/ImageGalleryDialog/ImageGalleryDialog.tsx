'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IconButton } from '@/components/atoms/IconButton/IconButton';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { useImageGalleryControls } from './hooks';
import type { ImageGalleryDialogProps } from './types';
import styles from './ImageGalleryDialog.module.css';

export function ImageGalleryDialog({
  images,
  index,
  dialogRef,
  onNavigate,
  label = 'Перегляд роботи студента',
}: ImageGalleryDialogProps) {
  const { viewport, onKeyDown } = useImageGalleryControls(onNavigate);
  const image = images[index];
  return (
    <Dialog
      dialogRef={dialogRef}
      className="gallery-dialog"
      aria-label={label}
      onKeyDown={onKeyDown}
      closeLabel="Закрити фото"
    >
      <div className={styles.viewport} ref={viewport}>
        {image && (
          <Image
            key={image.id}
            src={image.src}
            alt={image.alt}
            width={Math.round(image.width)}
            height={Math.round(image.height)}
            sizes="90vw"
            className="lightbox-image"
            draggable={false}
          />
        )}
      </div>
      <div className="lightbox-caption">
        <IconButton
          aria-label="Попереднє фото"
          disabled={images.length < 2}
          onClick={() => onNavigate(-1)}
        >
          <ArrowLeft />
        </IconButton>
        <p tabIndex={0} aria-live="polite" aria-atomic="true">
          {image?.title}
          <span>
            {image?.credit && `${image.credit} · `}
            {image ? index + 1 : 0}/{images.length}
          </span>
        </p>
        <IconButton
          aria-label="Наступне фото"
          disabled={images.length < 2}
          onClick={() => onNavigate(1)}
        >
          <ArrowRight />
        </IconButton>
      </div>
    </Dialog>
  );
}
