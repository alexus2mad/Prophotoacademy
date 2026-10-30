import type { Metadata } from 'next';
import type { CoursesPageProps } from '@/app/types';
import { connection } from 'next/server';
import { getContent } from '@/lib/content';
import { prioritizePrograms } from '@/lib/program-priority';
import { CatalogTemplate } from '@/components/templates/CatalogTemplate/CatalogTemplate';
export const metadata: Metadata = {
  title: 'Усі програми',
  description:
    'Оберіть курс фотографії, комерційного контенту чи Instagram. Класи, індивідуальне та корпоративне навчання.',
  alternates: { canonical: '/courses' },
};
export default async function Courses({ searchParams }: CoursesPageProps) {
  const query = new URLSearchParams();
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== 'pages') {
    await connection();
    for (const [key, value] of Object.entries(await searchParams)) {
      if (value === undefined) continue;
      for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
    }
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
