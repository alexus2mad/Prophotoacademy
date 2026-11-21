import { getContent } from '@/lib/content';
import { Photo } from '@/components/atoms/Photo/Photo';
import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { aboutContent } from '@/lib/site-editor/support-pages';
import { readSitePage } from '@/lib/site-editor/public';
import type { SiteRouteProps } from '@/lib/site-editor/types';
import { academyMetadata } from '@/lib/seo/metadata';
export const metadata = academyMetadata('/about-us', {
  title: 'Про фотошколу та викладачів',
  description:
    'Pro Photo Academy. Олена Попова, Олександра Куліняк і навчання фотографії, відео та візуального контенту.',
});
export default async function About({ searchParams }: SiteRouteProps) {
  const { intro, hero, stats, teamTitle, instructors } = aboutContent(
    await getContent(),
    await readSitePage('/about-us', searchParams),
  );
  return (
    <>
      <div className="container academy-about-page">
        <div className="page-heading">
          <h1>{intro.title}</h1>
        </div>
        <section className="about-intro">
          <PreparedPhoto
            image={hero}
            priority
            sizes="(max-width: 767px) calc(100vw - 40px), 44vw"
          />
          <div>
            <h2>{intro.heading}</h2>
            <p>{intro.description}</p>
            <p>{intro.detail}</p>
          </div>
        </section>
        <section className="section stats-grid" aria-label="Академія в цифрах">
          {stats.map((stat, i) => (
            <div key={i}>
              <strong>{stat.number}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>
        <section className="section" id="team">
          <div className="section-heading">
            <div>
              <h2>{teamTitle}</h2>
            </div>
          </div>
          <div className="instructors-grid">
            {instructors.map((i) => (
              <article className="instructor-card" key={i.id}>
                <div className="instructor-photo">
                  <Photo image={i.image} />
                </div>
                <h3>{i.name}</h3>
                <p>{i.role}</p>
                <p>{i.bio}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <Consultation compact />
    </>
  );
}
