import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioAcademyPrograms } from '@/components/organisms/StudioAcademyPrograms/StudioAcademyPrograms';
import { StudioAcademyCommunity } from '@/components/organisms/StudioAcademyCommunity/StudioAcademyCommunity';
import { StudioInquirySection } from '@/components/organisms/StudioInquirySection/StudioInquirySection';
import type { StudioAcademyTemplateProps } from './types';
import styles from './StudioAcademyTemplate.module.css';

export function StudioAcademyTemplate({ content }: StudioAcademyTemplateProps) {
  return (
    <>
      <section className={`${styles.hero} studio-light`}>
        <div className="studio-wrap">
          <p className={`${styles.label} studio-label studio-eyebrow`}>ProPhoto Academy</p>
          <h1>
            <span>*вчимо</span>Бачити більше
          </h1>
          <div className={styles.intro}>
            <p>
              Школа, яка об’єднує online + offline навчання і практику на реальних комерційних
              зйомках з відомими брендами. Навчаємо створювати візуал, що працює на ваш бренд,
              продажі та впізнаваність.
            </p>
            <div className={`${styles.actions} studio-actions`}>
              <a className="studio-button" href="#courses">
                Обрати курс →
              </a>
              <InquiryButton className="studio-button-outline">Отримати консультацію</InquiryButton>
            </div>
          </div>
          <nav className={styles.jump} aria-label="Розділи академії">
            <a href="#courses">Головні курси</a>
            <a href="#workshops">Воркшопи</a>
            <a href="#individual">Індивідуальне</a>
            <a href="#corporate">Корпоративне</a>
            <a href="#camp">ProPhoto Кемп</a>
            <a href="#lecturers">Лектори</a>
          </nav>
        </div>
      </section>
      <StudioAcademyPrograms
        programs={content.programs}
        offerings={content.offerings}
        images={content.images}
      />
      <StudioAcademyCommunity />
      <StudioInquirySection
        title="Допоможемо"
        hand="обрати"
        description="Заповніть форму та отримайте безкоштовну консультацію з нашим спеціалістом."
        layout="balanced"
      />
    </>
  );
}
