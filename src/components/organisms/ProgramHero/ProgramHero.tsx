import { Photo } from '@/components/atoms/Photo/Photo';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { dateLabel, formatLabel, money } from '@/lib/format';
import Link from 'next/link';
import type { ProgramHeroProps } from './types';
export function ProgramHero({ program, offering, image, presentation }: ProgramHeroProps) {
  const { price, open, isCustom, status, inquiryTitle, buttonLabel, hasFutureStart } = presentation;
  return (
    <section className="program-hero">
      <div>
        <nav className="breadcrumb" aria-label="Шлях до сторінки">
          <Link href="/courses">Усі програми</Link>
        </nav>
        <h1>{program.shortTitle}</h1>
        <p className="lead">{program.description}</p>
        {price !== undefined && (
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
              {isCustom
                ? 'Початок'
                : status === 'archived'
                  ? 'Відбулася'
                  : hasFutureStart
                    ? 'Дата на сторінці курсу'
                    : 'Найближчий старт'}
            </span>
            {isCustom
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
        <div className="program-hero-actions">
          {open ? (
            <a href="#packages" className="button">
              Обрати пакет
            </a>
          ) : (
            <InquiryButton programId={program.id} title={inquiryTitle} className="button">
              {buttonLabel}
            </InquiryButton>
          )}
          {!offering?.packages.length && (
            <a href="#program-overview" className="text-link">
              Деталі програми
            </a>
          )}
        </div>
      </div>
      <figure className="program-hero-photo">
        <Photo image={image} priority />
        <figcaption>{image.credit}</figcaption>
      </figure>
    </section>
  );
}
