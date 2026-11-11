import { SiteShell } from '@/components/templates/SiteShell/SiteShell';
import { StudioAcademyShell } from '@/components/templates/StudioAcademyShell/StudioAcademyShell';
import { academyDesign } from '@/lib/studio-design/variant';
import type { LayoutProps } from '@/app/types';
import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { socialMetadata } from '@/lib/social-images/metadata';
export const metadata: Metadata = {
  title: {
    default: 'Pro Photo Academy — створюйте кадри, які працюють',
    template: '%s · Pro Photo Academy',
  },
  description:
    'Курси фотографії, відео та створення контенту на телефон і камеру. Онлайн і в Києві.',
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
