import { NewSitePageLinks } from '@/components/molecules/NewSitePageLinks/NewSitePageLinks';
import { academyPrograms, workshops } from '@/lib/site-editor/brand/academy/programs';
import { bindSection } from '@/lib/site-editor/bind-section';
import Link from 'next/link';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioAcademyProgramRow } from '@/components/molecules/StudioAcademyProgramRow/StudioAcademyProgramRow';
import { findOffering } from '@/lib/content/selectors';
import { academyCatalogContent } from '@/lib/site-editor/brand/academy/catalog';
import type { StudioAcademyProgramsProps } from './types';
import styles from './StudioAcademyPrograms.module.css';

export function StudioAcademyPrograms({
  page,
  additionalPages = [],
  programs,
  offerings,
  images,
}: StudioAcademyProgramsProps) {
  const { text } = bindSection(page, academyPrograms);
  const { courses, intensive } = academyCatalogContent(programs, images, page);
  const individual = programs.find((program) => program.category === 'individual');
  const corporate = programs.find((program) => program.category === 'corporate');

  return (
    <>
      <section id="courses" className="studio-band studio-dark">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label studio-eyebrow">{text('courses-eyebrow')}</p>
            <h2 className="studio-title">{text('courses-title')}</h2>
          </header>
          <div className={styles.rows}>
            {courses.map(({ program, asset }) => (
              <StudioAcademyProgramRow
                key={program.id}
                program={program}
                offering={findOffering({ offerings }, program.id)}
                asset={asset}
              />
            ))}
            <NewSitePageLinks pages={additionalPages} kind="course" />
          </div>
        </div>
      </section>
      <section id="workshops" className="studio-band studio-light">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label studio-eyebrow">{text('workshops-eyebrow')}</p>
            <h2 className="studio-title">{text('workshops-title')}</h2>
          </header>
          <div className={styles.rows}>
            {intensive && (
              <article className={styles.workshop}>
                <h3>{intensive.shortTitle}</h3>
                <Link
                  href={`/${intensive.slug}`}
                  className={`${styles.archiveLink} ${styles.cardAction}`}
                  aria-label={`${intensive.shortTitle}: детальніше`}
                >
                  {text('workshop-action')}
                </Link>
              </article>
            )}
            <NewSitePageLinks pages={additionalPages} kind="workshop" />
            {workshops.map((_, i) => {
              const title = text('workshop-' + i);
              return (
                <article className={styles.workshop} key={title}>
                  <h3>{title}</h3>
                  <InquiryButton
                    title={`Дізнатися про воркшоп «${title}»`}
                    subject="workshops"
                    source="consultation"
                    className={`${styles.archiveLink} ${styles.cardAction}`}
                    aria-label={`${title}: як це було`}
                  >
                    {text('archive-action')}
                  </InquiryButton>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className={styles.formats} aria-label="Інші формати навчання">
        <article id="individual">
          <span className={styles.badge}>{text('individual-eyebrow')}</span>
          <h2>
            {individual ? (
              <Link href={`/${individual.slug}`} className={styles.formatLink}>
                {text('individual-title')}
              </Link>
            ) : (
              text('individual-title')
            )}
          </h2>
          <p>{text('individual-description')}</p>
          <InquiryButton
            programId={individual?.id}
            title={text('individual-title')}
            subject="individual-training"
            className={`studio-button ${styles.cardAction}`}
            aria-label="Індивідуальне навчання: залишити заявку"
          >
            {text('individual-action')}
          </InquiryButton>
        </article>
        <article id="corporate">
          <span className={styles.badge}>{text('corporate-eyebrow')}</span>
          <h2>
            {corporate ? (
              <Link href={`/${corporate.slug}`} className={styles.formatLink}>
                {text('corporate-title')}
              </Link>
            ) : (
              text('corporate-title')
            )}
          </h2>
          <p>{text('corporate-description')}</p>
          <InquiryButton
            programId={corporate?.id}
            title={text('corporate-title')}
            subject="corporate-training"
            className={`studio-button ${styles.cardAction}`}
            aria-label="Корпоративне навчання: обговорити формат"
          >
            {text('corporate-action')}
          </InquiryButton>
        </article>
        <article id="camp" className={styles.camp}>
          <span className={styles.badge}>{text('camp-eyebrow')}</span>
          <h2>{text('camp-title')}</h2>
          <p>{text('camp-description')}</p>
          <InquiryButton
            subject="camp"
            title={text('camp-form-title')}
            className={`studio-button-outline ${styles.cardAction}`}
            aria-label="ProPhoto Кемп: дізнатись дати"
          >
            {text('camp-action')}
          </InquiryButton>
        </article>
      </section>
    </>
  );
}
