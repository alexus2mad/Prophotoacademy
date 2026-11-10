import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getContent } from '@/lib/content';
import { findOffering } from '@/lib/content/selectors';
import { enrollmentOptions } from '@/lib/commerce/catalog';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioIntensiveTemplate } from '@/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate';

export const metadata: Metadata = { title: 'AI Artwork', alternates: { canonical: '/ai-artwork' } };
export default async function Intensive() {
  if (academyDesign() === 'legacy') redirect('/courses');
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== 'pages') await connection();
  const content = await getContent();
  const program = content.programs.find((entry) => entry.slug === 'ai-artwork');
  const offering = program ? findOffering(content, program.id) : undefined;
  return (
    <StudioIntensiveTemplate content={content} enrollment={await enrollmentOptions(offering)} />
  );
}
