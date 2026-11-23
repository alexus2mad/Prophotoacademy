import { foodPackageSummaries } from '@/lib/studio-food/package-copy';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import { ProgramPackages } from '@/components/organisms/ProgramPackages/ProgramPackages';
import type { StudioCreatorPackagesProps } from './types';
import styles from './StudioCreatorPackages.module.css';

export function StudioCreatorPackages({ page, ...props }: StudioCreatorPackagesProps) {
  const food = props.program.id === 'program-food';
  return (
    <div
      className={`${styles.packages} studio-light studio-band studio-wrap`}
      data-header-tone="light"
    >
      <ProgramPackages
        {...props}
        packageLayout={food ? 'disclosure' : 'editorial'}
        summaries={food ? foodPackageSummaries(page) : undefined}
        heading={
          <StudioCreatorHeading id="packages-title">
            Оберіть <span className="studio-hand">*свій</span> пакет
          </StudioCreatorHeading>
        }
      />
    </div>
  );
}
