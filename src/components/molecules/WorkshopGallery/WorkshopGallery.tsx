'use client';

import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { useStudioGallery } from '@/components/behaviors/GalleryRail/hooks';
import { ImageGalleryDialog } from '@/components/molecules/ImageGalleryDialog/ImageGalleryDialog';
import { useImageGallery } from '@/components/molecules/ImageGalleryDialog/hooks';
import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import { workshopFields } from '@/components/molecules/WorkshopSection/fields';
import { validCropPosition } from '@/lib/site-editor/intensive';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import styles from './WorkshopGallery.module.css';

export function WorkshopGallery({ section, editing }: MarketingBlockProps) {
  const { copy, value, itemIds, itemFieldId } = workshopFields(section, editing);
  const photos = itemIds
    .map((id) => {
      const imageId = itemFieldId(id, 'image');
      const src = value(imageId);
      const position = value(itemFieldId(id, 'position')).trim();
      const size = src.match(/-(\d+)x(\d+)\.[\w]+(?:\?|$)/);
      return {
        id,
        imageId,
        src: studioAssetUrl(src),
        width: Number(size?.[1]) || 960,
        height: Number(size?.[2]) || 1200,
        hasImage: !!src,
        alt: value(itemFieldId(id, 'alt')),
        position: position && validCropPosition(position) ? position : '50% 30%',
      };
    })
    .filter((photo) => editing || photo.hasImage);
  const rail = useStudioGallery(photos.length, !editing, 'viewport');
  const lightbox = useImageGallery(photos.length);
  const trackId = section.id + '-gallery';
  return (
    <>
      <StudioCreatorHeading id={section.id + '-title'}>
        {copy('heading')} {copy('accent', 'span', 'studio-hand')}
      </StudioCreatorHeading>
      {copy('description', 'p', styles.description)}
      <div
        id={trackId}
        className={styles.rail}
        ref={rail.track}
        role="region"
        aria-label="Фотографії практикуму"
        tabIndex={0}
        onKeyDown={rail.onKeyDown}
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className={styles.photo}
            data-site-field={editing ? photo.imageId : undefined}
            data-canvas-field={editing ? 'image' : undefined}
            aria-label={
              editing ? 'Обрати фотографію · ' + (index + 1) : 'Відкрити фото · ' + photo.alt
            }
            aria-haspopup={editing ? undefined : 'dialog'}
            onClick={editing ? undefined : () => lightbox.open(index)}
          >
            {photo.hasImage ? (
              <StudioImage
                fieldId={photo.imageId}
                asset={photo}
                alt={photo.alt}
                fit="cover"
                position={photo.position}
                sizes="(max-width: 760px) 40vw, 28vw"
              />
            ) : (
              'Обрати фотографію'
            )}
          </button>
        ))}
      </div>
      {photos.length > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            aria-label="Попередні фото"
            aria-controls={trackId}
            disabled={rail.position.start}
            onClick={() => rail.move(-1)}
          >
            ←
          </button>
          <span aria-live="polite" aria-atomic="true">
            {rail.position.index} / {photos.length}
          </span>
          <button
            type="button"
            aria-label="Наступні фото"
            aria-controls={trackId}
            disabled={rail.position.end}
            onClick={() => rail.move(1)}
          >
            →
          </button>
        </div>
      )}
      {!editing && photos.length > 0 && (
        <ImageGalleryDialog
          images={photos}
          label="Перегляд фотографій практикуму"
          dialogRef={lightbox.dialog}
          index={lightbox.index}
          onNavigate={lightbox.move}
        />
      )}
    </>
  );
}
