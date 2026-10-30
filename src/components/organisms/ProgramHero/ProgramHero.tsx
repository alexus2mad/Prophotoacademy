import { PhotoStack } from '@/components/molecules/PhotoStack/PhotoStack';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { formatLabel, money } from '@/lib/format';
import { programSchedule } from '@/lib/program-schedule';
import Link from 'next/link';
import type { ProgramHeroProps } from './types';
export function ProgramHero({ program, offering, images, presentation }: ProgramHeroProps) {
  const { price, open, isCustom, inquiryTitle, buttonLabel } = presentation;
  const schedule = programSchedule(program, offering);
  return (
    <section className="program-hero">
      <nav className="breadcrumb" aria-label="Шлях до сторінки">
        <Link href="/courses">Усі програми</Link>
      </nav>
      <div className="program-hero-copy">
        <h1>{program.shortTitle}</h1>
        <p className="lead">{program.description}</p>
        {program.equipmentDescription && (
          <p className="program-equipment">{program.equipmentDescription}</p>
        )}
        {price !== undefined && !offering?.packages.length && (
          <p className="program-hero-price">
            <strong>від {money(price)}</strong>
          </p>
        )}
        <div className="program-facts">
          <div>
            <span>Формат</span>
            {program.deliveryDescription ||
              (offering ? formatLabel[offering.format] : 'За запитом')}
          </div>
          {!isCustom && offering?.duration && (
            <div>
              <span>Тривалість</span>
              {offering.duration}
            </div>
          )}
          <div>
            <span>
              {schedule.status} · {schedule.label}
            </span>
            {schedule.date ? (
              <time dateTime={schedule.date}>{schedule.value}</time>
            ) : (
              schedule.value
            )}
          </div>
        </div>
        {schedule.explanation && <p className="program-schedule-note">{schedule.explanation}</p>}
        {presentation.testEnrollment && (
          <p className="program-schedule-note">Тестовий запис — без оплати</p>
        )}
        {!open && (
          <div className="program-hero-actions">
            <InquiryButton
              programId={program.id}
              offeringId={offering?.id}
              title={inquiryTitle}
              className="button"
            >
              {buttonLabel}
            </InquiryButton>
          </div>
        )}
      </div>
      <div className="program-hero-photo">
        <PhotoStack
          images={images}
          label={`Фотографії: ${program.shortTitle}`}
          sizes="(max-width: 599px) calc(100vw - 88px), 400px"
        />
      </div>
    </section>
  );
}
