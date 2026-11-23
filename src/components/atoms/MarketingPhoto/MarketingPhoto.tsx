import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import type { MarketingPhotoProps } from './types';

export function MarketingPhoto({ image, alt = '', editing, sizes }: MarketingPhotoProps) {
  if (!image || (!image.value && !editing)) return null;
  const dimensions = image.value.match(/-(\d+)x(\d+)\.[\w]+(?:\?|$)/);
  const photo = image.value && (
    <StudioImage
      asset={{
        src: image.value,
        width: Number(dimensions?.[1]) || 1440,
        height: Number(dimensions?.[2]) || 960,
      }}
      alt={alt}
      sizes={sizes || '(max-width: 1120px) 100vw, 1120px'}
      fieldId={image.id}
    />
  );
  if (!editing) return photo || null;
  return (
    <button
      type="button"
      data-canvas-field="image"
      data-site-field={image.id}
      aria-label={'Обрати фотографію · ' + image.label}
    >
      {photo || 'Обрати фотографію'}
    </button>
  );
}
