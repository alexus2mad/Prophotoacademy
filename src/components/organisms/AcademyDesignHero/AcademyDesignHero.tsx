import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { EcosystemWordmark } from '@/components/atoms/EcosystemWordmark/EcosystemWordmark';
import { academyHomePhoto } from '@/lib/photography/academy-home';
import { siteHref } from '@/lib/ecosystem';
import Link from 'next/link';
import type { AcademyDesignHeroProps } from './types';
export function AcademyDesignHero({ shopUrl }: AcademyDesignHeroProps) {
  return (
    <section className="academy-design-hero" aria-labelledby="academy-home-title">
      <div className="academy-design-hero-photo">
        <PreparedPhoto
          image={academyHomePhoto('hero')}
          priority
          sizes="(max-width: 767px) 1200px, 100vw"
        />
      </div>
      <div className="academy-design-hero-copy">
        <h1 id="academy-home-title">
          <span>Вчимо</span>
          <strong>Бачити більше</strong>
        </h1>
        <nav className="academy-design-ecosystem" aria-label="Екосистема ProPhoto">
          <a
            href={siteHref('hub')}
            data-ecosystem-target="hub"
            aria-label="Студія — сайт ProPhoto Hub"
          >
            <EcosystemWordmark name="STUDIO" />
          </a>
          <Link
            href="/courses"
            className="academy-design-current"
            aria-label="Академія — програми навчання"
          >
            <EcosystemWordmark name="ACADEMY" />
          </Link>
          <a href={shopUrl} aria-label="Магазин — окремий сайт ProPhoto">
            <EcosystemWordmark name="SHOP" />
          </a>
        </nav>
        <Link className="button academy-hero-action" href="/courses">
          Обрати програму
        </Link>
      </div>
    </section>
  );
}
