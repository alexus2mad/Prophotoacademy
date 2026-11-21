import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioCreatorAction } from '@/components/molecules/StudioCreatorAction/StudioCreatorAction';
import { StudioCreatorCurriculumLink } from '@/components/molecules/StudioCreatorCurriculumLink/StudioCreatorCurriculumLink';
import { InstallmentMethods } from '@/components/molecules/InstallmentMethods/InstallmentMethods';
import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { programSchedule } from '@/lib/program-schedule';
import type { StudioCreatorHeroProps } from './types';
import styles from './StudioCreatorHero.module.css';

export function StudioCreatorHero({
  program,
  offering,
  presentation,
  showInstallments,
  editorial,
}: StudioCreatorHeroProps) {
  const { hero, intro } = editorial;
  const schedule = programSchedule(program, offering);
  const facts =
    presentation.open && schedule.date ? (
      <>
        Старт{' '}
        <time dateTime={schedule.date} title={schedule.value}>
          {new Intl.DateTimeFormat('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            timeZone: 'Europe/Kyiv',
          }).format(new Date(`${schedule.date}T12:00:00Z`))}
        </time>
      </>
    ) : presentation.status === 'closed' ? (
      schedule.status
    ) : (
      `${schedule.label}: ${schedule.value}`
    );
  return (
    <>
      <section
        className={`${styles.hero} studio-dark`}
        data-header-tone="dark"
        data-site-section="hero"
        aria-labelledby="creator-title"
      >
        <StudioImage
          fieldId="image"
          asset={hero.asset}
          alt={hero.alt}
          className={styles.photo}
          style={
            {
              '--hero-position': hero.position,
              '--hero-mobile-position': hero.mobilePosition,
            } as CSSProperties
          }
          sizes="(max-width: 760px) 1560px, 100vw"
          fit="cover"
          preload
        />
        <div className={`${styles.copy} studio-wrap`}>
          <h1 id="creator-title">
            <span data-site-field="accent" className={styles.hand}>
              {hero.hand}
            </span>
            <span data-site-field="title" className={styles.title}>
              {hero.title}
            </span>
          </h1>
          <p data-site-field="subject" className={styles.subject}>
            {hero.subject}
          </p>
          <div className={styles.facts}>
            <span data-site-locked="">{facts}</span>
            {offering?.duration && <span data-site-locked="">{offering.duration}</span>}
            {hero.facts?.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>
          <div data-site-locked="" className="studio-actions">
            {/* Phones get the same action from the fixed StudioMobileAction bar. */}
            <div className={styles.desktopAction}>
              <StudioCreatorAction
                program={program}
                offering={offering}
                presentation={presentation}
              />
            </div>
            <StudioCreatorCurriculumLink />
          </div>
        </div>
      </section>
      <section
        data-site-section="introduction"
        id="program-about"
        className={`${styles.intro} studio-dark studio-band studio-wrap`}
        aria-labelledby="creator-intro-title"
      >
        <p className="studio-label studio-eyebrow">{intro.eyebrow}</p>
        <h2 id="creator-intro-title">
          {intro.heading.lines.map((line, index) => (
            <Fragment key={line}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}{' '}
          <span className="studio-hand">{intro.heading.hand}</span>
        </h2>
        <p className={styles.description}>{intro.description}</p>
        <div data-site-locked="" className={styles.capsule}>
          <span>{facts}</span>
          {offering?.duration && <span>{offering.duration}</span>}
        </div>
        {presentation.price !== undefined && (
          <div data-site-locked="" className={styles.price}>
            <p className="studio-label">Вартість від</p>
            <p>
              <strong>{new Intl.NumberFormat('uk-UA').format(presentation.price)}</strong>
              <span>грн</span>
            </p>
          </div>
        )}
        {showInstallments && (
          <div data-site-locked="" className={styles.installments}>
            <InstallmentMethods prominent />
          </div>
        )}
        {presentation.status === 'closed' && (
          <p data-site-locked="" className={styles.note}>
            Про наступний набір повідомимо за заявкою
          </p>
        )}
        {offering?.packages.length ? (
          <a className="studio-button" href="#packages">
            Переглянути пакети<span aria-hidden="true">→</span>
          </a>
        ) : (
          <StudioCreatorAction program={program} offering={offering} presentation={presentation} />
        )}
      </section>
    </>
  );
}
