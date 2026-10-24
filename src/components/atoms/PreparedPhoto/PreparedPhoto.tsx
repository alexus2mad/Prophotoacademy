import { preload } from 'react-dom';
import { Photo } from '@/components/atoms/Photo/Photo';
import { preparedPhoto } from '@/lib/photography/prepared';
import type { PreparedPhotoProps } from './types';

export function PreparedPhoto({
  image,
  priority = false,
  eager = false,
  sizes,
}: PreparedPhotoProps) {
  const prepared = preparedPhoto(image.src);
  if (!prepared) return <Photo image={image} priority={priority} eager={eager} sizes={sizes} />;
  if (priority)
    preload(prepared.src, {
      as: 'image',
      imageSrcSet: prepared.srcSet,
      imageSizes: sizes,
      fetchPriority: 'high',
    });
  return (
    <img
      src={prepared.src}
      srcSet={prepared.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority || eager ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'low'}
      decoding="async"
      draggable={false}
      className="photo"
      style={{ objectPosition: image.position || '50% 50%', objectFit: image.fit || 'cover' }}
    />
  );
}
