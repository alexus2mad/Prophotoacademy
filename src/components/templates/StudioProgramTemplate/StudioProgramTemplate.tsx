import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { Gallery } from '@/components/organisms/Gallery/Gallery';
import { MobileEnrollment } from '@/components/organisms/MobileEnrollment/MobileEnrollment';
import { PracticePreview } from '@/components/organisms/PracticePreview/PracticePreview';
import { ProgramPackages } from '@/components/organisms/ProgramPackages/ProgramPackages';
import { StudioInquirySection } from '@/components/organisms/StudioInquirySection/StudioInquirySection';
import { StudioProgramHero } from '@/components/organisms/StudioProgramHero/StudioProgramHero';
import { StudioProgramFaculty } from '@/components/organisms/StudioProgramFaculty/StudioProgramFaculty';
import { StudioProgramReviews } from '@/components/organisms/StudioProgramReviews/StudioProgramReviews';
import { studioProgramPage } from '@/lib/studio-program/selectors';
import type { StudioProgramTemplateProps } from './types';
import styles from './StudioProgramTemplate.module.css';

export function StudioProgramTemplate({
  program,
  content,
  enrollment,
}: StudioProgramTemplateProps) {
  const { offering, presentation, works, instructors, reviews, hero } = studioProgramPage(
    program,
    content,
    enrollment,
  );
  const hasPackages = Boolean(offering?.packages.length);
  const links = [
    ...(program.outcomes.length ? [['#program-about', 'Про курс']] : []),
    ...(program.audience.length ? [['#program-audience', 'Кому']] : []),
    ...(hasPackages ? [['#packages', 'Пакети']] : []),
    ...(program.modules.length ? [['#program-curriculum', 'Програма']] : []),
    ...(instructors.length ? [['#program-lecturers', 'Лектори']] : []),
    ...(works.length ? [['#student-works', 'Роботи студентів']] : []),
    ...(reviews.length ? [['#program-reviews', 'Відгуки']] : []),
  ];

  return (
    <div className={styles.program}>
      <StudioProgramHero
        program={program}
        offering={offering}
        presentation={presentation}
        hero={hero}
      />
      <nav className={styles.navigation} aria-label="Розділи курсу">
        <div className="studio-wrap">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          {presentation.open && hasPackages ? (
            <a className="studio-button" href="#packages">
              Обрати пакет
            </a>
          ) : (
            <InquiryButton
              className="studio-button"
              programId={program.id}
              offeringId={offering?.id}
              title={presentation.inquiryTitle}
            >
              {presentation.buttonLabel}
            </InquiryButton>
          )}
        </div>
      </nav>
      {!!program.outcomes.length && (
        <section
          id="program-about"
          className="studio-dark studio-band studio-wrap"
          aria-labelledby="program-about-title"
        >
          <header className={styles.heading}>
            <p className="studio-label">Про курс</p>
            <h2 id="program-about-title" className="studio-title">
              Чого ви <span className="studio-hand">*навчитеся</span>
            </h2>
          </header>
          <ul className={styles.outcomes}>
            {program.outcomes.map((outcome) => (
              <li key={outcome}>
                <h3>{outcome}</h3>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!program.audience.length && (
        <section
          id="program-audience"
          className="studio-light studio-band studio-wrap"
          aria-labelledby="program-audience-title"
        >
          <header className={styles.heading}>
            <p className="studio-label">Кому</p>
            <h2 id="program-audience-title" className="studio-title">
              Для тих, хто
            </h2>
          </header>
          <ul className={styles.audience}>
            {program.audience.map((audience) => (
              <li key={audience}>
                <h3>{audience}</h3>
              </li>
            ))}
          </ul>
        </section>
      )}
      {hasPackages && offering && (
        <div className={`${styles.packages} studio-light studio-wrap`}>
          <ProgramPackages program={program} offering={offering} enrollment={enrollment} />
        </div>
      )}
      {!!program.modules.length && (
        <section
          id="program-curriculum"
          className="studio-dark studio-band studio-wrap"
          aria-labelledby="program-curriculum-title"
        >
          <header className={styles.heading}>
            <p className="studio-label">Програма</p>
            <h2 id="program-curriculum-title" className="studio-title">
              Як проходить навчання
            </h2>
          </header>
          <div className={styles.accordion}>
            {program.modules.map((module, index) => (
              <details key={module.title} open={index === 0}>
                <summary>{module.title}</summary>
                <ul>
                  {module.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}
      <div className={`${styles.practice} studio-light studio-wrap`}>
        <PracticePreview content={content} programId={program.id} compact />
      </div>
      {!!instructors.length && <StudioProgramFaculty instructors={instructors} />}
      {!!works.length && (
        <section
          id="student-works"
          className={`${styles.gallery} studio-dark studio-band`}
          aria-labelledby="program-works-title"
        >
          <header className={`${styles.heading} studio-wrap`}>
            <h2 id="program-works-title" className="studio-title">
              Роботи <span className="studio-hand">*студентів</span>
            </h2>
          </header>
          <Gallery works={works} images={content.images} />
        </section>
      )}
      {!!reviews.length && <StudioProgramReviews reviews={reviews} />}
      {!!program.faqs.length && (
        <section
          className={`${styles.faq} studio-light studio-band studio-wrap`}
          aria-labelledby="program-faq-title"
        >
          <header className={styles.heading}>
            <p className="studio-label">Питання</p>
            <h2 id="program-faq-title" className="studio-title">
              Що варто знати
            </h2>
          </header>
          <div className={styles.accordion}>
            {program.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      <StudioInquirySection
        title="Є питання про"
        hand="курс?"
        layout="balanced"
        context={{
          programId: program.id,
          offeringId: offering?.id,
          title: program.shortTitle,
          source: 'consultation',
        }}
      />
      <div className={styles.enrollment}>
        <MobileEnrollment price={presentation.price}>
          {presentation.open && hasPackages ? (
            <a href="#packages" className="studio-button">
              Обрати пакет
            </a>
          ) : (
            <InquiryButton
              className="studio-button"
              programId={program.id}
              offeringId={offering?.id}
              title={presentation.inquiryTitle}
            >
              {presentation.buttonLabel}
            </InquiryButton>
          )}
        </MobileEnrollment>
      </div>
    </div>
  );
}
