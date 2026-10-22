import { Photo } from '@/components/atoms/Photo/Photo';
import { formatLabel, money, startingPrice } from '@/lib/format';
import { ArrowUpRight } from 'lucide-react';
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
            <div className="cover-main-photo">
              <Photo image={cover} priority sizes="(max-width: 767px) calc(100vw - 40px), 65vw" />
            </div>
            <figcaption>Фото: {cover.credit}</figcaption>
          </figure>
          <div className="cover-statement">
            {primary ? (
              <>
                <p className="eyebrow">Курс у фокусі</p>
                <h2>{primary.shortTitle}</h2>
                <p className="cover-description">{primary.description}</p>
                <p className="cover-course-meta">
                  {offering ? formatLabel[offering.format] : 'Дізнатися більше'}
                  {offering?.duration && <> · {offering.duration}</>}
                </p>
                {price !== undefined && (
                  <p className="cover-course-price">
                    <span>від </span>
                    {money(price)}
                  </p>
                )}
                <Link href={'/' + primary.slug} className="button">
                  Деталі курсу <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </>
            ) : (
              <>
                <p className="cover-description">
                  Фото, яке відчувають. Погляд, який впізнають. Навчимо створювати своє.
                </p>
                <a href="#courses" className="button">
                  Знайти свій курс <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </>
            )}
          </div>
          <figure className="cover-inset">
            <div className="cover-inset-photo">
              <Photo image={underwater} sizes="(max-width: 767px) 42vw, 25vw" />
            </div>
            <figcaption>Світло. Колір. Твоя уява.</figcaption>
          </figure>
        </div>
        <div className="cover-navigation">
          <a href="#courses" className="text-link">
            Знайти свою програму <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
