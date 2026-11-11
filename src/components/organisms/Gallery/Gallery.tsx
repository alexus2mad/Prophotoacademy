'use client';
import { WorkCard } from '@/components/molecules/WorkCard/WorkCard';
import { ImageGalleryDialog } from '@/components/molecules/ImageGalleryDialog/ImageGalleryDialog';
import { useGallery } from './hooks';
import type { GalleryProps } from './types';

export function Gallery({ works, images }: GalleryProps) {
  const { index, dialog, entries, open, move } = useGallery({ works, images });
  return (
    <>
      <div className="work-grid">
        {entries.map((image, i) => {
          const work = works.find((item) => item.id === image.id)!;
          return <WorkCard key={work.id} work={work} image={image} onOpen={() => open(i)} />;
        })}
      </div>
      <ImageGalleryDialog dialogRef={dialog} images={entries} index={index} onNavigate={move} />
    </>
  );
}
