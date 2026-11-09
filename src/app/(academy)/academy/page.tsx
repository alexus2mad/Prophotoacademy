import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioAcademyTemplate } from '@/components/templates/StudioAcademyTemplate/StudioAcademyTemplate';

export const metadata: Metadata = { title: 'Академія', alternates: { canonical: '/academy' } };
export default async function Academy() {
  if (academyDesign() === 'legacy') redirect('/courses');
  return <StudioAcademyTemplate content={await getContent()} />;
}
