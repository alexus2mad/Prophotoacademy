import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getContent } from '@/lib/content';
import { findOffering } from '@/lib/content/selectors';
import { enrollmentOptions } from '@/lib/commerce/catalog';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioIntensiveTemplate } from '@/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate';
import { ProgramTemplate } from '@/components/templates/ProgramTemplate/ProgramTemplate';
import { academyMetadata } from '@/lib/seo/metadata';
import { academyIndexPath } from '@/lib/navigation/academy';

export const metadata = academyMetadata('/ai-artwork', {
  title: 'AI Artwork: інтенсив зі студійної зйомки та обробки',
  description:
    'Практичний інтенсив «Від кадрів до AI Artwork»: студійна зйомка, розробка концепції та генеративна обробка фотографій в Adobe Photoshop.',
});
export default async function Intensive() {
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== 'pages') await connection();
  const content = await getContent();
  const program = content.programs.find((entry) => entry.slug === 'ai-artwork');
  const offering = program ? findOffering(content, program.id) : undefined;
  const enrollment = await enrollmentOptions(offering);
  if (academyDesign() === 'legacy') {
    if (!program) redirect(academyIndexPath);
    return <ProgramTemplate program={program} content={content} enrollment={enrollment} />;
  }
  return <StudioIntensiveTemplate content={content} enrollment={enrollment} />;
}
