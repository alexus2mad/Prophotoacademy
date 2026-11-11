import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioSpacesTemplate } from '@/components/templates/StudioSpacesTemplate/StudioSpacesTemplate';
import { socialMetadata } from '@/lib/social-images/metadata';

export const metadata: Metadata = {
  title: 'Фотостудія',
  alternates: { canonical: '/photo-studio' },
  robots: { index: false, follow: false },
  ...socialMetadata('/photo-studio'),
};
export default async function PhotoStudio() {
  if (academyDesign() === 'legacy') redirect('/hub');
  return <StudioSpacesTemplate content={await getContent()} />;
}
