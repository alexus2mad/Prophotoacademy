import { getContent } from '@/lib/content';
import type { SiteRouteProps } from '@/lib/site-editor/types';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import { readSitePage } from '@/lib/site-editor/public';
import { worksContent } from '@/lib/site-editor/support-pages';
import { Gallery } from '@/components/organisms/Gallery/Gallery';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { academyMetadata } from '@/lib/seo/metadata';
export const metadata = academyMetadata('/student-work', {
  title: 'Роботи студентів фотошколи',
  description:
    'Фотографія на телефон і камеру. Предметні, фуд-зйомки та портрети студентів Pro Photo Academy.',
});
export default async function Work({ searchParams }: SiteRouteProps) {
  const [content, page] = await Promise.all([
    getContent(),
    readSitePage('/student-work', searchParams),
  ]);
  const { title, description, works, images } = worksContent(content, page);
  return (
    <>
      <div className="container student-gallery-page">
        <MarketingSlot page={page} id="intro" />
        <div className="page-heading" data-site-section="intro">
          <h1 data-site-field="title">{title}</h1>
          <p className="lead muted" data-site-field="description">
            {description}
          </p>
        </div>
        <MarketingSlot page={page} id="gallery" />
        <Gallery works={works} images={images} />
      </div>
      <MarketingSlot page={page} id="inquiry" />
      <Consultation compact />
      <MarketingComposition page={page} />
    </>
  );
}
