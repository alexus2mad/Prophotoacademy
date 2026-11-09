import { getContent } from '@/lib/content';
import { AcademyHomeTemplate } from '@/components/templates/AcademyHomeTemplate/AcademyHomeTemplate';
import { StudioHomeTemplate } from '@/components/templates/StudioHomeTemplate/StudioHomeTemplate';
import { academyDesign } from '@/lib/studio-design/variant';

export default async function Home() {
  const content = await getContent();
  return academyDesign() === 'studio' ? (
    <StudioHomeTemplate content={content} />
  ) : (
    <AcademyHomeTemplate content={content} />
  );
}
