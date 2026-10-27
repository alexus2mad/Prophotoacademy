import { Photo } from '@/components/atoms/Photo/Photo';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { dateLabel, formatLabel, money } from '@/lib/format';
import Link from 'next/link';
import type { ProgramHeroProps } from './types';
export function ProgramHero({ program, offering, image, presentation }: ProgramHeroProps) {
  const { price, open, isCustom, status, inquiryTitle, buttonLabel, hasFutureStart } = presentation;
  return (
    <section className="program-hero">
      <nav className="breadcrumb" aria-label="Шлях до сторінки">
        <Link href="/courses">Усі програми</Link>
      </nav>
      <div className="program-hero-copy">
        <h1>{program.shortTitle}</h1>
        <p className="lead">{program.description}</p>
        {price !== undefined && !offering?.packages.length && (
          <p className="program-hero-price">
            <strong>від {money(price)}</strong>
          </p>
        )}
        <div className="program-facts">
          <div>
            <span>Формат</span>
            {offering ? formatLabel[offering.format] : 'За запитом'}
          </div>
          {!isCustom && offering?.duration && (
            <div>
              <span>Тривалість</span>
              {offering.duration}
            </div>
          )}
          <div>
            <span>
              {presentation.testEnrollment
                ? 'Тестовий запис'
                : isCustom
                  ? 'Початок'
                  : status === 'archived'
                    ? 'Відбулася'
                    : hasFutureStart
                      ? 'Дата на сторінці курсу'
                      : 'Найближчий старт'}
            </span>
            {presentation.testEnrollment
              ? 'Без оплати'
              : isCustom
                ? 'Узгодимо з вами'
                : status === 'archived'
                  ? dateLabel(offering?.startDate)
                  : open
                    ? dateLabel(offering?.startDate)
                    : hasFutureStart
                      ? dateLabel(offering?.startDate)
                      : 'Уточнюємо набір'}
          </div>
        </div>
        {!open && (
          <div className="program-hero-actions">
            <InquiryButton programId={program.id} title={inquiryTitle} className="button">
              {buttonLabel}
            </InquiryButton>
          </div>
        )}
      </div>
      <figure className="program-hero-photo">
        <Photo
          image={image}
          sizes="(max-width: 599px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), 42vw"
        />
        {image.credit && <figcaption>{image.credit}</figcaption>}
      </figure>
    </section>
  );
}
