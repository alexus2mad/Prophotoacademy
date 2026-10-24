import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { formatLabel, money, startingPrice } from '@/lib/format';
import Link from 'next/link';
import type { FeaturedProgramProps } from './types';

export function FeaturedProgram({ program, offering, image }: FeaturedProgramProps) {
  const price = startingPrice(offering);
  return (
    <section className="featured-program container" aria-labelledby="featured-program-title">
      <figure className="featured-program-photo">
        <PreparedPhoto image={image} sizes="(max-width: 767px) 80vw, 36vw" />
        <figcaption>{image.credit}</figcaption>
      </figure>
      <div className="featured-program-copy">
        <p className="eyebrow">Academy · Курс у фокусі</p>
        <h2 id="featured-program-title">{program.shortTitle}</h2>
        <p className="featured-program-description">
          {program.homepageDescription || program.description}
        </p>
        <p className="featured-program-meta">
          {offering ? formatLabel[offering.format] : 'Дізнатися більше'}
          {offering?.duration && <> · {offering.duration}</>}
        </p>
        <div className="featured-program-action">
          {price !== undefined && (
            <p className="featured-program-price">
              <span>від </span>
              {money(price)}
            </p>
          )}
          <Link href={'/' + program.slug} className="button">
            Деталі курсу
          </Link>
        </div>
      </div>
    </section>
  );
}
