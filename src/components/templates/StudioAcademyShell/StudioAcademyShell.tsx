import { EcosystemMeasurement } from '@/components/behaviors/EcosystemMeasurement/EcosystemMeasurement';
import { StudioHeader } from '@/components/organisms/StudioHeader/StudioHeader';
import { StudioFooter } from '@/components/organisms/StudioFooter/StudioFooter';
import { StudioInquiryDrawer } from '@/components/organisms/StudioInquiryDrawer/StudioInquiryDrawer';
import { studioThemeClassName } from '@/lib/typography/fonts';
import type { StudioAcademyShellProps } from './types';

export function StudioAcademyShell({ children, settings }: StudioAcademyShellProps) {
  return (
    <div className={studioThemeClassName}>
      <EcosystemMeasurement site="academy" />
      <StudioHeader settings={settings} />
      <main id="main">{children}</main>
      <StudioFooter settings={settings} />
      <StudioInquiryDrawer />
    </div>
  );
}
