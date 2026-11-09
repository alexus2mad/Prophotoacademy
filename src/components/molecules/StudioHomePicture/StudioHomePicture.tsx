import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { StudioHomePictureProps } from './types';

export function StudioHomePicture({
  image,
  mobileImage,
  alt,
  className,
  eager,
  sizes,
}: StudioHomePictureProps) {
  return (
    <picture className={className}>
      {mobileImage && (
        <source
          media="(max-width: 760px)"
          srcSet={studioAssetUrl(mobileImage.src)}
          width={mobileImage.width}
          height={mobileImage.height}
        />
      )}
      <StudioImage asset={image} alt={alt} eager={eager} sizes={sizes} fit="cover" />
    </picture>
  );
}
