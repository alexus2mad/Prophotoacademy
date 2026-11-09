import Image from 'next/image';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { StudioImageProps } from './types';

export function StudioImage({
  asset,
  alt,
  className,
  sizes = '(max-width: 767px) 100vw, 50vw',
  preload = false,
  eager = false,
  fit,
  position,
  style,
}: StudioImageProps) {
  return (
    <Image
      src={studioAssetUrl(asset.src)}
      width={Math.round(asset.width)}
      height={Math.round(asset.height)}
      alt={alt}
      className={className}
      sizes={sizes}
      preload={preload}
      loading={!preload && eager ? 'eager' : undefined}
      style={{ objectFit: fit, objectPosition: position, ...style }}
    />
  );
}
