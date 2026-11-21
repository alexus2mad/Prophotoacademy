import type { SiteRouteProps } from '@/lib/site-editor/types';
import { readSitePage } from '@/lib/site-editor/public';
import { getContent } from '@/lib/content';
import { AcademyHomeTemplate } from '@/components/templates/AcademyHomeTemplate/AcademyHomeTemplate';
import { StudioHomeTemplate } from '@/components/templates/StudioHomeTemplate/StudioHomeTemplate';
import { JsonLd } from '@/components/atoms/JsonLd/JsonLd';
import { academyDesign } from '@/lib/studio-design/variant';
import { academyMetadata, academyName } from '@/lib/seo/metadata';
import { academyHomeSchema } from '@/lib/seo/structured-data';

const description =
  'Фотошкола в Києві та онлайн. Курси фотографії, відео й створення контенту на телефон і камеру для початківців та тих, хто працює з брендами.';

export const metadata = academyMetadata('/', {
  title: { absolute: `Фотошкола в Києві та онлайн · ${academyName}` },
  description,
});

export default async function Home({ searchParams }: SiteRouteProps = {}) {
  const content = await getContent();
  const studio = academyDesign() === 'studio';
  const [page, studioPage, shopPage] = studio
    ? await Promise.all([
        readSitePage('/', searchParams),
        readSitePage('/photo-studio'),
        readSitePage('/shop'),
      ])
    : [];
  return (
    <>
      <JsonLd data={academyHomeSchema(content.settings, description)} />
      {studio ? (
        <StudioHomeTemplate
          content={content}
          page={page}
          studioPage={studioPage}
          shopPage={shopPage}
        />
      ) : (
        <AcademyHomeTemplate content={content} />
      )}
    </>
  );
}
