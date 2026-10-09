import type { Metadata } from 'next';
import type { CoursesPageProps } from '@/app/types';
import { getContent } from '@/lib/content';
import { filterPrograms } from '@/lib/catalog/selectors';
import { CatalogTemplate } from '@/components/templates/CatalogTemplate/CatalogTemplate';
export const metadata: Metadata = {
  title: 'Усі програми',
  description:
    'Оберіть курс фотографії, комерційного контенту чи Instagram. Класи, індивідуальне та корпоративне навчання.',
  alternates: { canonical: '/courses' },
};
export default async function Courses({ searchParams }: CoursesPageProps) {
  const content = await getContent();
  const filters = await searchParams;
  return (
    <CatalogTemplate
      content={content}
      programs={filterPrograms(content, filters)}
      filters={filters}
    />
  );
}
