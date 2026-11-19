import type { StudioCreatorActionProps } from '@/components/molecules/StudioCreatorAction/types';
import type { StudioCourseEditorial } from '@/lib/studio-creator/types';
export type StudioCreatorHeroProps = StudioCreatorActionProps & {
  showInstallments: boolean;
  editorial: Pick<StudioCourseEditorial, 'hero' | 'intro'>;
};
