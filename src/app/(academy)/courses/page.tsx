import type { Metadata } from 'next';
import type { CoursesPageProps } from '@/app/types';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { prioritizePrograms } from '@/lib/program-priority';
import { CatalogTemplate } from '@/components/templates/CatalogTemplate/CatalogTemplate';
import { StudioAcademyTemplate } from '@/components/templates/StudioAcademyTemplate/StudioAcademyTemplate';
import { academyDesign } from '@/lib/studio-design/variant';
import { studioCatalogDestination } from '@/lib/studio-pages/navigation';
import { socialMetadata } from '@/lib/social-images/metadata';
export function generateMetadata(): Metadata {
  if (academyDesign() === 'studio') {
    return {
      title: 'Академія',
      alternates: { canonical: '/academy' },
      ...socialMetadata('/academy'),
    };
  }
  return {
    title: 'Усі програми',
    description:
      'Оберіть курс фотографії, комерційного контенту чи Instagram. Класи, індивідуальне та корпоративне навчання.',
    alternates: { canonical: '/courses' },
    ...socialMetadata('/courses'),
  };
}
export default async function Courses({ searchParams }: CoursesPageProps) {
  const query = new URLSearchParams();
  const review = process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages';
  if (!review) {
    await connection();
    for (const [key, value] of Object.entries(await searchParams)) {
      if (value === undefined) continue;
      for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
    }
  }
  if (academyDesign() === 'studio') {
    // A temporary redirect keeps future legacy experiments free of cached loops.
    if (!review) redirect(studioCatalogDestination(query));
    // GitHub Pages has no server redirects; keep its saved URL fully reviewable.
    return <StudioAcademyTemplate content={await getContent()} />;
  }
  const content = await getContent();
  return (
    <CatalogTemplate
      content={content}
      programs={prioritizePrograms(content.programs, content.settings.primaryProgramId)}
      query={query.toString()}
    />
  );
}
