import { Photo } from '@/components/atoms/Photo/Photo';
import { formatLabel } from '@/lib/format';
import Link from 'next/link';
import type { AcademyHeroProps } from './types';
export function AcademyHero({ primary, offering, heroImage, content }: AcademyHeroProps) {
  return (
    <section
      className={`exhibition-hero container ${primary ? 'exhibition-hero--primary' : ''}`}
      aria-labelledby="hero-title"
    >
      <Photo
        image={heroImage}
        priority
        className="exhibition-image"
        sizes={primary ? '(max-width: 767px) 100vw, 55vw' : '(max-width: 767px) 100vw, 80vw'}
      />
      <div className="exhibition-scrim" aria-hidden="true" />
      <div className="exhibition-copy">
        <p className="eyebrow">
          {primary ? 'Курс Pro Photo Academy' : 'Академія фотографії та візуального контенту'}
        </p>
        <h1 id="hero-title">{primary?.shortTitle || content.settings.heroTitle}</h1>
        <p className="exhibition-description">
          {primary
            ? primary.homepageDescription || primary.description
            : content.settings.heroDescription}
        </p>
        {primary && offering && (
          <p className="exhibition-facts">
            {formatLabel[offering.format]}
            {offering.duration && <> · {offering.duration}</>}
          </p>
        )}
        {primary ? (
          <Link href={`/${primary.slug}`} className="button">
            Переглянути курс
          </Link>
        ) : (
          <a href="#courses" className="button">
            Знайти свій курс
          </a>
        )}
      </div>
      <div className="exhibition-label">
        <span>{heroImage.credit}</span>
      </div>
    </section>
  );
}
