import { SiteShell } from '@/components/templates/SiteShell/SiteShell';
import { StudioAcademyShell } from '@/components/templates/StudioAcademyShell/StudioAcademyShell';
import { academyDesign } from '@/lib/studio-design/variant';
import type { LayoutProps } from '@/app/types';
import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { academyName } from '@/lib/seo/metadata';
import { socialMetadata } from '@/lib/social-images/metadata';
export const metadata: Metadata = {
  title: {
    default: academyName,
    template: `%s · ${academyName}`,
  },
  ...socialMetadata('/'),
};
export default async function AcademyLayout({ children }: LayoutProps) {
  const content = await getContent();
  if (academyDesign() === 'studio')
    return <StudioAcademyShell settings={content.settings}>{children}</StudioAcademyShell>;
  return (
    <SiteShell site="academy" settings={content.settings}>
      {children}
    </SiteShell>
  );
}
