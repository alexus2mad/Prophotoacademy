import { getContent } from '@/lib/content';
import { Gallery } from '@/components/organisms/Gallery/Gallery';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { academyMetadata } from '@/lib/seo/metadata';
export const metadata = academyMetadata('/student-work', {
  title: 'Роботи студентів фотошколи',
  description:
    'Фотографія на телефон і камеру. Предметні, фуд-зйомки та портрети студентів Pro Photo Academy.',
});
export default async function Work() {
  const content = await getContent();
  return (
    <>
      <div className="container student-gallery-page">
        <div className="page-heading">
          <h1>Роботи студентів</h1>
          <p className="lead muted">
            Фотографії на телефон і камеру, створені під час навчання в академії.
          </p>
        </div>
        <Gallery works={content.works} images={content.images} />
      </div>
      <Consultation compact />
    </>
  );
}
