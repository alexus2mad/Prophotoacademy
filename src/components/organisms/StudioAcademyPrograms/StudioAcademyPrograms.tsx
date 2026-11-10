import Link from 'next/link';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioAcademyProgramRow } from '@/components/molecules/StudioAcademyProgramRow/StudioAcademyProgramRow';
import { findOffering } from '@/lib/content/selectors';
import { studioAcademyCourses, studioProgramImage } from '@/lib/studio-pages/selectors';
import type { StudioAcademyProgramsProps } from './types';
import styles from './StudioAcademyPrograms.module.css';

export function StudioAcademyPrograms({ programs, offerings, images }: StudioAcademyProgramsProps) {
  const courses = studioAcademyCourses(programs);
  const workshops = [
    'Комерційний чоловічий портрет',
    'Ню та в білизні: каталожна та арт зйомка',
    'Виїзний воркшоп: Карпати',
    'Виїзний воркшоп: Дружківський кар’єр',
  ];
  return (
    <>
      <section id="courses" className="studio-band studio-dark">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label studio-eyebrow">Онлайн з практикою в Києві</p>
            <h2 className="studio-title">Головні курси</h2>
          </header>
          <div className={styles.rows}>
            {courses.map((program) => (
              <StudioAcademyProgramRow
                key={program.id}
                program={program}
                offering={findOffering({ offerings }, program.id)}
                asset={studioProgramImage(program, images)}
              />
            ))}
          </div>
        </div>
      </section>
      <section id="workshops" className="studio-band studio-light">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label studio-eyebrow">Практика в студії та на виїзді</p>
            <h2 className="studio-title">Воркшопи</h2>
          </header>
          <div className={styles.rows}>
            {workshops.map((title) => (
              <article className={styles.workshop} key={title}>
                <h3>{title}</h3>
                <InquiryButton
                  title={`Дізнатися про воркшоп «${title}»`}
                  subject="workshops"
                  source="consultation"
                  className={styles.archiveLink}
                >
                  Як це було →
                </InquiryButton>
              </article>
            ))}
          </div>
          <nav className={styles.more} aria-label="Інші навчальні події">
            <Link href="/ai-artwork">Інтенсив AI artwork →</Link>
            <Link href="/courses">Усі програми →</Link>
          </nav>
        </div>
      </section>
      <section className={styles.formats} aria-label="Інші формати навчання">
        <article id="individual">
          <span className={styles.badge}>Під ваш рівень</span>
          <h2>Індивідуальне навчання</h2>
          <p>
            Індивідуальне навчання з фокусом на ваш рівень і цілі: персональний підхід, глибока
            робота з технікою, світлом і стилем, розвиток авторського бачення та впевненості у
            зйомці.
          </p>
          <InquiryButton
            programId={programs.find((program) => program.category === 'individual')?.id}
            title="Індивідуальне навчання"
            subject="individual-training"
            className="studio-button"
          >
            Залишити заявку →
          </InquiryButton>
        </article>
        <article id="corporate">
          <span className={styles.badge}>Для команд</span>
          <h2>Корпоративне навчання</h2>
          <p>
            Корпоративне навчання для команд і бізнесу: практичні формати, адаптація під задачі
            бренду, розвиток візуального мислення та створення контенту, що працює на результат.
          </p>
          <InquiryButton
            programId={programs.find((program) => program.category === 'corporate')?.id}
            title="Корпоративне навчання"
            subject="corporate-training"
            className="studio-button"
          >
            Обговорити формат →
          </InquiryButton>
        </article>
        <article id="camp" className={styles.camp}>
          <span className={styles.badge}>Виїзна програма</span>
          <h2>ProPhoto Кемп</h2>
          <p>Напишіть нам, щоб дізнатися дати наступного кемпу.</p>
          <InquiryButton
            subject="camp"
            title="Наступний ProPhoto Кемп"
            className="studio-button-outline"
          >
            Дізнатись дати →
          </InquiryButton>
        </article>
      </section>
    </>
  );
}
