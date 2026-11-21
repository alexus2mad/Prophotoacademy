import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import type { StudioHomeWork } from '@/lib/studio-home/types';
export type StudioHomeWorksProps = BrandContentProps & {
  works: StudioHomeWork[];
};
