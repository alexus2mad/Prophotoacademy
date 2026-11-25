import type { ReactNode } from 'react';
import type { ImageAsset, Work } from '@/lib/content/types';
import type { GalleryImage } from '@/components/molecules/ImageGalleryDialog/types';
import type { CourseWorksOpening } from '@/lib/studio-creator/types';
import type { SitePage } from '@/lib/site-editor/types';
export type StudioCreatorWork = GalleryImage & {
  imageId?: string;
  device: Work['device'];
  preserveFraming?: boolean;
  position?: string;
};
export type StudioCreatorWorksProps = {
  page?: SitePage;
  layout?: 'two-rows';
  works: Work[];
  images: ImageAsset[];
  opening?: CourseWorksOpening;
  action?: ReactNode;
  /** Filter order; the first device with works is selected initially. */
  devices?: readonly Work['device'][];
};
