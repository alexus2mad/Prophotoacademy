import Link from 'next/link';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { formatLabel, money } from '@/lib/format';
import { programSchedule } from '@/lib/program-schedule';
import type { StudioProgramHeroProps } from './types';
import styles from './StudioProgramHero.module.css';

export function StudioProgramHero({
  program,
  offering,
  presentation,
  hero,
}: StudioProgramHeroProps) {
  const schedule = programSchedule(program, offering);
  return (
    <section className={`${styles.hero} studio-light`} aria-labelledby="program-title">
      <div className={`${styles.copy} studio-wrap`} data-header-tone="light">
        <Link className={styles.back} href="/courses">
          ← Усі курси
        </Link>
        <p className={`${styles.status} ${presentation.open ? styles.open : ''}`}>
          {schedule.status}
        </p>
        <h1 id="program-title">{program.title}</h1>
        {program.eyebrow && <p className={styles.subtitle}>{program.eyebrow}</p>}
        <p className={styles.description}>{program.description}</p>
        <div className={styles.facts}>
          <p>
            {program.deliveryDescription ||
              (offering ? formatLabel[offering.format] : 'За запитом')}
          </p>
          {!presentation.isCustom && offering?.duration && <p>{offering.duration}</p>}
          <p>
            {schedule.label}:{' '}
            {schedule.date ? (
              <time dateTime={schedule.date}>{schedule.value}</time>
            ) : (
              schedule.value
            )}
          </p>
        </div>
        {program.equipmentDescription && (
          <p className={styles.note}>{program.equipmentDescription}</p>
        )}
        <div className={styles.price}>
          <span className="studio-label">
            {presentation.price !== undefined ? 'Вартість від' : 'Вартість'}
          </span>
          <strong>
            {presentation.price !== undefined ? money(presentation.price) : 'За запитом'}
          </strong>
        </div>
        {schedule.explanation && <p className={styles.note}>{schedule.explanation}</p>}
        {presentation.testEnrollment && <p className={styles.note}>Тестовий запис — без оплати</p>}
        <div className={`${styles.actions} studio-actions program-hero-actions`}>
          {presentation.open && offering?.packages.length ? (
            <a href="#packages" className="studio-button">
              Обрати пакет <span aria-hidden="true">→</span>
            </a>
          ) : (
            <InquiryButton
              programId={program.id}
              offeringId={offering?.id}
              title={presentation.inquiryTitle}
              className="studio-button"
            >
              {presentation.buttonLabel} <span aria-hidden="true">→</span>
            </InquiryButton>
          )}
          <InquiryButton
            programId={program.id}
            offeringId={offering?.id}
            title={program.shortTitle}
            className="studio-button-outline"
          >
            Поставити питання
          </InquiryButton>
        </div>
      </div>
      <div className={styles.image} data-header-tone="dark">
        <StudioImage
          asset={hero.asset}
          alt={hero.alt}
          fit="cover"
          sizes="(max-width: 760px) 100vw, 45vw"
          preload
        />
      </div>
    </section>
  );
}
