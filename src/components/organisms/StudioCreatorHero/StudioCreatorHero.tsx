import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioCreatorAction } from '@/components/molecules/StudioCreatorAction/StudioCreatorAction';
import { StudioCreatorCurriculumLink } from '@/components/molecules/StudioCreatorCurriculumLink/StudioCreatorCurriculumLink';
import { InstallmentMethods } from '@/components/molecules/InstallmentMethods/InstallmentMethods';
import { creatorAssets } from '@/lib/studio-creator/assets';
import { programSchedule } from '@/lib/program-schedule';
import type { StudioCreatorHeroProps } from './types';
import styles from './StudioCreatorHero.module.css';

export function StudioCreatorHero({
  program,
  offering,
  presentation,
  showInstallments,
}: StudioCreatorHeroProps) {
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
        aria-labelledby="creator-title"
      >
        <StudioImage
          asset={creatorAssets.hero}
          alt="Чорно-білий портрет жінки у серпанку"
          className={styles.photo}
          sizes="(max-width: 760px) 1560px, 100vw"
          fit="cover"
          preload
        />
        <div className={`${styles.copy} studio-wrap`}>
          <h1 id="creator-title">
            <span className={styles.hand}>*комерційний</span>
            <span className={styles.title}>Контент-креатор</span>
          </h1>
          <p className={styles.subject}>Курс фото та відеозйомки</p>
          <div className={styles.facts}>
            <span>{facts}</span>
            {offering?.duration && <span>{offering.duration}</span>}
          </div>
          <div className="studio-actions">
            <StudioCreatorCurriculumLink />
          </div>
        </div>
      </section>
      <section
        id="program-about"
        className={`${styles.intro} studio-dark studio-band studio-wrap`}
        aria-labelledby="creator-intro-title"
      >
        <p className="studio-label studio-eyebrow">Онлайн наживо + практика офлайн у Києві</p>
        <h2 id="creator-intro-title">
          Неважливо, на
          <br />
          що ви знімаєте
          <br />
          Важливо <span className="studio-hand">*як</span>
        </h2>
        <p className={styles.description}>
          Камера, телефон чи плівка — ми навчаємо бачити: композицію, світло, колір і налаштування
          камери. Тисячі випускників уже переконалися.
        </p>
        <div className={styles.capsule}>
          <span>{facts}</span>
          {offering?.duration && <span>{offering.duration}</span>}
        </div>
        {presentation.price !== undefined && (
          <div className={styles.price}>
            <p className="studio-label">Вартість від</p>
            <p>
              <strong>{new Intl.NumberFormat('uk-UA').format(presentation.price)}</strong>
              <span>грн</span>
            </p>
          </div>
        )}
        {showInstallments && (
          <div className={styles.installments}>
            <InstallmentMethods prominent />
          </div>
        )}
        {presentation.status === 'closed' && (
          <p className={styles.note}>Про наступний набір повідомимо за заявкою</p>
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
