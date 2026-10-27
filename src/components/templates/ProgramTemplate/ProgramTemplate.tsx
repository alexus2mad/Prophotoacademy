import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { Gallery } from '@/components/organisms/Gallery/Gallery';
import { MobileEnrollment } from '@/components/organisms/MobileEnrollment/MobileEnrollment';
import { PracticePreview } from '@/components/organisms/PracticePreview/PracticePreview';
import { ProgramFaqs } from '@/components/organisms/ProgramFaqs/ProgramFaqs';
import { ProgramHero } from '@/components/organisms/ProgramHero/ProgramHero';
import { ProgramInstructors } from '@/components/organisms/ProgramInstructors/ProgramInstructors';
import { ProgramOverview } from '@/components/organisms/ProgramOverview/ProgramOverview';
import { ProgramPackages } from '@/components/organisms/ProgramPackages/ProgramPackages';
import { findImage, findOffering } from '@/lib/content/selectors';
import { money } from '@/lib/format';
import { programPresentation } from '@/lib/programs/selectors';
import type { ProgramTemplateProps } from './types';
export function ProgramTemplate({ program, content, enrollment }: ProgramTemplateProps) {
  const works = program.workIds.flatMap((id) => content.works.find((work) => work.id === id) || []);
  const heroImage = findImage(content, program.imageId);
  const offering = findOffering(content, program.id);
  const presentation = programPresentation(program, offering);
  if (enrollment) {
    presentation.open = enrollment.packageIds.length > 0;
    presentation.testEnrollment = presentation.open && enrollment.mode === 'disabled';
  }
  const { price, inquiryTitle, buttonLabel } = presentation;
  const open = presentation.open;
  const enrollmentAction = open ? (
    <a href="#packages" className="button button-wide">
      Обрати пакет
    </a>
  ) : (
    <InquiryButton programId={program.id} title={inquiryTitle} className="button button-wide">
      {buttonLabel}
    </InquiryButton>
  );
  return (
    <>
      <div className="container program-landing">
        <ProgramHero
          program={program}
          offering={offering}
          image={heroImage}
          presentation={presentation}
        />
        {!!offering?.packages.length && (
          <ProgramPackages offering={offering} program={program} enrollment={enrollment} />
        )}
        <div className="program-layout" id="program-overview">
          <div className="program-content">
            <ProgramOverview program={program} />
            <PracticePreview content={content} programId={program.id} compact />
            <ProgramInstructors program={program} content={content} />
          </div>
          <aside className="enrollment-panel" aria-label="Запис на навчання">
            <h3>{program.shortTitle}</h3>
            {price !== undefined && (
              <div className="price">
                <span className="muted">від </span>
                {money(price)}
              </div>
            )}
            {enrollmentAction}
            {!open && !!offering?.packages.length && (
              <a href="#packages" className="panel-link">
                Пакети й вартість
              </a>
            )}
          </aside>
        </div>
        {!!works.length && (
          <section
            className="program-student-work student-exhibition"
            id="student-works"
            aria-labelledby="student-works-title"
          >
            <div className="section-heading">
              <div>
                <h2 id="student-works-title">Роботи студентів</h2>
              </div>
              <p className="section-side">На телефон і камеру</p>
            </div>
            <Gallery works={works} images={content.images} />
          </section>
        )}
        {!!program.faqs.length && (
          <div className="program-faq-section">
            <ProgramFaqs program={program} />
          </div>
        )}
      </div>
      <MobileEnrollment price={price}>
        {open ? (
          <a href="#packages" className="button">
            Обрати пакет
          </a>
        ) : (
          <InquiryButton programId={program.id} title={inquiryTitle} className="button">
            {buttonLabel}
          </InquiryButton>
        )}
      </MobileEnrollment>
    </>
  );
}
