import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { StudioCreatorWorksProps, StudioCreatorWork } from './types';

export function creatorWorks({
  works,
  images,
  opening,
}: StudioCreatorWorksProps): StudioCreatorWork[] {
  const originals = works.flatMap((work) => {
    const image = images.find((item) => item.id === work.imageId);
    return image
      ? [
          {
            ...image,
            id: work.id,
            imageId: image.id,
            device: work.device,
            src: studioAssetUrl(image.src),
          },
        ]
      : [];
  });
  if (!opening) return originals;
  return [
    ...opening.ids.flatMap((id) => originals.find((item) => item.id === id) ?? []),
    ...opening.extras.map((extra) => ({ ...extra, src: studioAssetUrl(extra.src) })),
    ...originals.filter((item) => !opening.ids.includes(item.id)),
  ];
}
