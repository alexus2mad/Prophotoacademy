import { creatorAssets } from '@/lib/studio-creator/assets';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { StudioCreatorWorksProps, StudioCreatorWork } from './types';

export function creatorWorks({ works, images }: StudioCreatorWorksProps): StudioCreatorWork[] {
  const originals = works.flatMap((work) => {
    const image = images.find((item) => item.id === work.imageId);
    return image
      ? [{ ...image, id: work.id, device: work.device, src: studioAssetUrl(image.src) }]
      : [];
  });
  const openingIds = ['student-beauty-shadows', 'student-lipstick-study'];
  return [
    ...openingIds.flatMap((id) => originals.find((item) => item.id === id) ?? []),
    {
      ...creatorAssets.monochrome,
      id: 'creator-monochrome',
      device: 'camera',
      alt: 'Чорно-білий портрет жінки, робота студента',
      src: studioAssetUrl(creatorAssets.monochrome.src),
    },
    {
      ...creatorAssets.curly,
      id: 'creator-curly',
      device: 'camera',
      preserveFraming: true,
      alt: 'Портрет усміхненої жінки з кучерявим волоссям',
      src: studioAssetUrl(creatorAssets.curly.src),
    },
    ...originals.filter((item) => !openingIds.includes(item.id)),
  ];
}
