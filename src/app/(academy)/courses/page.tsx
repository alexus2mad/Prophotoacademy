import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { prioritizePrograms } from '@/lib/program-priority';
import { CatalogTemplate } from '@/components/templates/CatalogTemplate/CatalogTemplate';
export const metadata: Metadata = {
  title: 'Усі програми',
  description:
    'Оберіть курс фотографії, комерційного контенту чи Instagram. Класи, індивідуальне та корпоративне навчання.',
  alternates: { canonical: '/courses' },
};
export default async function Courses() {
  const content = await getContent();
  return (
    <CatalogTemplate
      content={content}
      programs={prioritizePrograms(content.programs, content.settings.primaryProgramId)}
    />
  );
}
