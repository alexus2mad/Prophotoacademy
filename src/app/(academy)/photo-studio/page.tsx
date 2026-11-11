import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioSpacesTemplate } from '@/components/templates/StudioSpacesTemplate/StudioSpacesTemplate';

export const metadata: Metadata = {
  title: 'Фотостудія',
  alternates: { canonical: '/photo-studio' },
  robots: { index: false, follow: false },
};
export default async function PhotoStudio() {
  if (academyDesign() === 'legacy') redirect('/hub');
  return <StudioSpacesTemplate content={await getContent()} />;
}
