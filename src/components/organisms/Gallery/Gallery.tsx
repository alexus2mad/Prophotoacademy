'use client';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { WorkCard } from '@/components/molecules/WorkCard/WorkCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useGallery } from './hooks';
import type { GalleryProps } from './types';

export function Gallery({ works, images }: GalleryProps) {
  const { index, setIndex, dialog, current, image, open } = useGallery({ works, images });
  return (
    <>
      <div className="work-grid">
        {works.map((work, i) => {
          const img = images.find((image) => image.id === work.imageId)!;
          return <WorkCard key={work.id} work={work} image={img} onOpen={() => open(i)} />;
        })}
      </div>
      <Dialog
        dialogRef={dialog}
        className="gallery-dialog"
        aria-label="Перегляд роботи студента"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % works.length);
          if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + works.length) % works.length);
        }}
        closeLabel="Закрити фото"
      >
        {image && (
          <Image
            key={image.id}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="90vw"
            className="lightbox-image"
          />
        )}
        <div className="lightbox-caption">
          <button
            className="icon-button"
            aria-label="Попереднє фото"
            onClick={() => setIndex((i) => (i - 1 + works.length) % works.length)}
          >
            <ArrowLeft />
          </button>
          <p>
            {current?.title}
            <span>
              {image?.credit} · {index + 1}/{works.length}
            </span>
          </p>
          <button
            className="icon-button"
            aria-label="Наступне фото"
            onClick={() => setIndex((i) => (i + 1) % works.length)}
          >
            <ArrowRight />
          </button>
        </div>
      </Dialog>
    </>
  );
}
