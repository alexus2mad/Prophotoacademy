import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioIntensiveTemplate } from '@/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate';

export const metadata: Metadata = { title: 'AI Artwork', alternates: { canonical: '/ai-artwork' } };
export default async function Intensive() {
  if (academyDesign() === 'legacy') redirect('/courses');
  return <StudioIntensiveTemplate content={await getContent()} />;
}
