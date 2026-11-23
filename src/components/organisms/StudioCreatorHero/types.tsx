import type { StudioCreatorActionProps } from '@/components/molecules/StudioCreatorAction/types';
import type { StudioCourseEditorial } from '@/lib/studio-creator/types';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
export type StudioCreatorHeroProps = BrandContentProps &
  StudioCreatorActionProps & {
    showInstallments: boolean;
    editorial: Pick<StudioCourseEditorial, 'hero' | 'intro'>;
  };
