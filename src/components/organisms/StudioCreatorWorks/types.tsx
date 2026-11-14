import type { ImageAsset, Work } from '@/lib/content/types';
import type { GalleryImage } from '@/components/molecules/ImageGalleryDialog/types';
export type StudioCreatorWork = GalleryImage & { device: Work['device']; partial?: boolean };
export type StudioCreatorWorksProps = { works: Work[]; images: ImageAsset[] };
