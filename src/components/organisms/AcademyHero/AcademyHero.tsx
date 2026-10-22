import { Photo } from '@/components/atoms/Photo/Photo';
import { formatLabel, money, startingPrice } from '@/lib/format';
import Link from 'next/link';
import type { AcademyHeroProps } from './types';

export function AcademyHero({ primary, offering, heroImage, content }: AcademyHeroProps) {
  const cover = content.images.find((image) => image.id === 'editorial-strawberry') || heroImage;
  const underwater =
    content.images.find((image) => image.id === 'editorial-underwater') || heroImage;
  const price = startingPrice(offering);
  return (
    <section className="academy-cover" aria-labelledby="hero-title">
      <div className="container">
        <div className="cover-intro">
          <p>Академія фотографії Олени Попової</p>
          <p>На телефон і камеру · Онлайн та Київ</p>
        </div>
        <h1 id="hero-title">
          Бачити <em>більше</em>
        </h1>
        <div className="cover-composition">
          <figure className="cover-main">
            <Photo image={cover} priority sizes="(max-width: 767px) 100vw, 65vw" />
            <figcaption>Фотографія Олени Попової</figcaption>
          </figure>
          <div className="cover-statement">
            <p>
              Фото, яке відчувають.
              <br />
              Погляд, який впізнають.
              <br />
              <strong>Навчимо створювати своє.</strong>
            </p>
            <a href="#courses" className="button">
              Знайти свій курс <span aria-hidden="true">↗</span>
            </a>
          </div>
          <figure className="cover-inset">
            <Photo image={underwater} sizes="(max-width: 767px) 42vw, 25vw" />
            <figcaption>Світло. Колір. Твоя уява.</figcaption>
          </figure>
          <p className="cover-side-note">Від першого кадру до власної візуальної мови</p>
        </div>
        {primary && (
          <Link className="cover-featured" href={'/' + primary.slug}>
            <span>У фокусі</span>
            <strong>{primary.shortTitle}</strong>
            <span>
              {offering ? formatLabel[offering.format] : 'Дізнатися більше'}
              {price !== undefined && <> · від {money(price)}</>}
            </span>
            <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
    </section>
  );
}
