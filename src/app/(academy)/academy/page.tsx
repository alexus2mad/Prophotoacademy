import type { CoursesPageProps } from '@/app/types';
import { connection } from 'next/server';
import { getContent } from '@/lib/content';
import { prioritizePrograms } from '@/lib/program-priority';
import { academyDesign } from '@/lib/studio-design/variant';
import { CatalogTemplate } from '@/components/templates/CatalogTemplate/CatalogTemplate';
import { StudioAcademyTemplate } from '@/components/templates/StudioAcademyTemplate/StudioAcademyTemplate';
import { academyIndexMetadata } from '@/lib/seo/metadata';

export function generateMetadata() {
  return academyIndexMetadata(academyDesign());
}

export default async function Academy({ searchParams }: CoursesPageProps) {
  const content = await getContent();
  if (academyDesign() === 'studio') return <StudioAcademyTemplate content={content} />;

  const query = new URLSearchParams();
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== 'pages') {
    await connection();
    for (const [key, value] of Object.entries(await searchParams)) {
      if (value === undefined) continue;
      for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
    }
  }
  return (
    <CatalogTemplate
      content={content}
      programs={prioritizePrograms(content.programs, content.settings.primaryProgramId)}
      query={query.toString()}
    />
  );
}
