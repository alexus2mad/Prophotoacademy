import { getContent } from '@/lib/content';
import { Photo } from '@/components/atoms/Photo/Photo';
import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { aboutContent } from '@/lib/site-editor/support-pages';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import { readSitePage } from '@/lib/site-editor/public';
import type { SiteRouteProps } from '@/lib/site-editor/types';
import { academyMetadata } from '@/lib/seo/metadata';
export const metadata = academyMetadata('/about-us', {
  title: 'Про фотошколу та викладачів',
  description:
    'Pro Photo Academy. Олена Попова, Олександра Куліняк і навчання фотографії, відео та візуального контенту.',
});
export default async function About({ searchParams }: SiteRouteProps) {
  const [content, page] = await Promise.all([
    getContent(),
    readSitePage('/about-us', searchParams),
  ]);
  const { intro, hero, stats, teamTitle, instructors } = aboutContent(content, page);
  return (
    <>
      <div className="container academy-about-page">
        <div className="page-heading" data-site-section="intro">
          <h1 data-site-field="title">{intro.title}</h1>
        </div>
        <section className="about-intro" data-site-section="intro">
          <PreparedPhoto
            image={hero}
            priority
            sizes="(max-width: 767px) calc(100vw - 40px), 44vw"
          />
          <div>
            <h2 data-site-field="heading">{intro.heading}</h2>
            <p data-site-field="description">{intro.description}</p>
            <p data-site-field="detail">{intro.detail}</p>
          </div>
        </section>
        <section
          className="section stats-grid"
          aria-label="Академія в цифрах"
          data-site-section="figures"
        >
          {stats.map((stat, i) => (
            <div key={i}>
              <strong data-site-field={'number-' + i}>{stat.number}</strong>
              <span data-site-field={'label-' + i}>{stat.label}</span>
            </div>
          ))}
        </section>
        <section className="section" id="team" data-site-section="team">
          <div className="section-heading">
            <div>
              <h2 data-site-field="title">{teamTitle}</h2>
            </div>
          </div>
          <div className="instructors-grid">
            {instructors.map((i) => (
              <article data-site-section={'person-' + i.id} className="instructor-card" key={i.id}>
                <div className="instructor-photo">
                  <Photo image={i.image} />
                </div>
                <h3 data-site-field="name">{i.name}</h3>
                <p data-site-field="role">{i.role}</p>
                <p data-site-field="bio">{i.bio}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <Consultation compact />
      <MarketingComposition page={page} />
    </>
  );
}
