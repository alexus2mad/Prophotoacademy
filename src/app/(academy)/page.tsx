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

export default async function Home() {
  const content = await getContent();
  const Template = academyDesign() === 'studio' ? StudioHomeTemplate : AcademyHomeTemplate;
  return (
    <>
      <JsonLd data={academyHomeSchema(content.settings, description)} />
      <Template content={content} />
    </>
  );
}
