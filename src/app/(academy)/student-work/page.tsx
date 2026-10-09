import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { Gallery } from '@/components/organisms/Gallery/Gallery';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
export const metadata: Metadata = {
  title: 'Роботи студентів',
  description:
    'Фотографія на телефон і камеру. Предметні, фуд-зйомки та портрети студентів Pro Photo Academy.',
  alternates: { canonical: '/student-work' },
};
export default async function Work() {
  const content = await getContent();
  return (
    <>
      <div className="container">
        <div className="page-heading">
          <h1>Роботи студентів</h1>
          <p className="lead muted">
            Фотографії на телефон і камеру, створені під час навчання в академії.
          </p>
        </div>
        <Gallery works={content.works} images={content.images} />
      </div>
      <Consultation />
    </>
  );
}
