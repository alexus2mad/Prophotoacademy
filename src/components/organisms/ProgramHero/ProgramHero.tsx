import { PhotoStack } from '@/components/molecules/PhotoStack/PhotoStack';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { dateLabel, formatLabel, money } from '@/lib/format';
import Link from 'next/link';
import type { ProgramHeroProps } from './types';
export function ProgramHero({ program, offering, images, presentation }: ProgramHeroProps) {
  const { price, open, isCustom, status, inquiryTitle, buttonLabel, hasFutureStart } = presentation;
  return (
    <section className="program-hero">
      <nav className="breadcrumb" aria-label="Шлях до сторінки">
        <Link href="/courses">Усі програми</Link>
      </nav>
      <div className="program-hero-copy">
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
          <a
            href={!open && offering?.packages.length ? '#packages' : '#program-overview'}
            className="text-link"
          >
            {!open && offering?.packages.length ? 'Пакети й вартість' : 'Деталі програми'}
          </a>
        </div>
      </div>
      <div className="program-hero-photo">
        <PhotoStack
          images={images}
          label={'Фотографії: ' + program.shortTitle}
          sizes="(max-width: 767px) calc(100vw - 64px), (max-width: 1200px) 44vw, 520px"
        />
      </div>
    </section>
  );
}
