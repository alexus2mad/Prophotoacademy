import type { Metadata } from 'next';
import { getContent, findImage } from '@/lib/content';
import { canonicalUrl, siteHref } from '@/lib/ecosystem';
import { Photo } from '@/components/atoms/Photo/Photo';
export const metadata: Metadata = {
  title: 'Про ProPhoto',
  alternates: { canonical: canonicalUrl('hub', 'about') },
};
export default async function AboutProPhoto() {
  const content = await getContent();
  return (
    <div className="container hub-detail">
      <section className="hub-detail-opening">
        <div>
          <p className="eyebrow">ProPhoto</p>
          <h1>Знання та простір для створення контенту</h1>
          <p className="lead">
            Academy допомагає навчитися створювати контент. Hub дає простір для власних зйомок і
            практики в Києві.
          </p>
          <h2 className="ecosystem-founder-name">Олена Попова</h2>
          <p className="equipment-note">
            Рекламна фотографка з понад 15 роками досвіду. Засновниця ProPhoto — спільної справи, що
            поєднує навчання й студію.
          </p>
          <a
            className="text-link"
            href={siteHref('academy', 'about-us#team')}
            data-ecosystem-target="academy"
          >
            Познайомитися з командою Academy
          </a>
        </div>
        <figure>
          <Photo image={findImage(content, 'olena')} priority />
        </figure>
      </section>
    </div>
  );
}
