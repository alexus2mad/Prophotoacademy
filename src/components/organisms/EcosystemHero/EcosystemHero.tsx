import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { siteHref } from '@/lib/ecosystem';
import type { EcosystemHeroProps } from './types';

export function EcosystemHero({ content }: EcosystemHeroProps) {
  const photographs = [
    { id: 'editorial-strawberry', slot: 'portrait', caption: '' },
    { id: 'editorial-underwater', slot: 'water', caption: '' },
    { id: content.hub.heroImageId, slot: 'studio', caption: 'ProPhoto Hub · Київ' },
    { id: 'student-cherries', slot: 'product', caption: 'Робота студента академії' },
    { id: 'workshop', slot: 'people', caption: 'Практика в академії' },
  ];
  return (
    <section className="ecosystem-opening container" aria-labelledby="hero-title">
      <div className="ecosystem-composition">
        <div className="ecosystem-message">
          <p className="eyebrow">ProPhoto · Світ фотографії</p>
          <h1 id="hero-title">
            Бачити <em>більше</em>
          </h1>
          <p className="ecosystem-description">
            Навчання, простір, інструменти та люди для твоєї фотографії.
          </p>
          <nav className="ecosystem-paths" aria-label="Відкрий світ ProPhoto">
            <a href="#courses">
              <span className="ecosystem-path-brand">Academy</span>
              <strong>Навчатися</strong>
              <span>Знайти свій погляд</span>
            </a>
            <a href={siteHref('hub')} data-ecosystem-target="hub">
              <span className="ecosystem-path-brand">Hub</span>
              <strong>Знімати</strong>
              <span>Простір для ідей</span>
            </a>
            <a href={content.settings.shop}>
              <span className="ecosystem-path-brand">Shop</span>
              <strong>Обирати</strong>
              <span>Інструменти для зйомки</span>
            </a>
          </nav>
          <a href={content.settings.telegram} className="ecosystem-community">
            <span>Бути разом</span>
            <span>Спільнота ProPhoto</span>
          </a>
        </div>
        {photographs.map(({ id, slot, caption }) => {
          const image = content.images.find((item) => item.id === id);
          if (!image) return null;
          return (
            <figure key={slot} className={'ecosystem-print ecosystem-print-' + slot}>
              <div className="ecosystem-print-paper">
                <PreparedPhoto
                  image={image}
                  priority={slot === 'portrait'}
                  eager
                  sizes={
                    slot === 'people'
                      ? '(max-width: 767px) 64vw, (max-width: 1099px) 32vw, 22vw'
                      : '(max-width: 767px) 42vw, (max-width: 1099px) 30vw, 22vw'
                  }
                />
              </div>
              <figcaption>{caption || image.credit}</figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
