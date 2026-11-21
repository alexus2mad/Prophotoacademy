import { academyIntroduction } from '@/lib/site-editor/brand/academy/introduction';
import { bindSection } from '@/lib/site-editor/bind-section';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { StudioAcademyPrograms } from '@/components/organisms/StudioAcademyPrograms/StudioAcademyPrograms';
import { StudioAcademyCommunity } from '@/components/organisms/StudioAcademyCommunity/StudioAcademyCommunity';
import { StudioInquirySection } from '@/components/organisms/StudioInquirySection/StudioInquirySection';
import type { StudioAcademyTemplateProps } from './types';
import styles from './StudioAcademyTemplate.module.css';

export function StudioAcademyTemplate({
  page,
  additionalPages,
  content,
}: StudioAcademyTemplateProps) {
  const { text } = bindSection(page, academyIntroduction);
  return (
    <>
      <section data-site-section="introduction" className={`${styles.hero} studio-light`}>
        <div className="studio-wrap">
          <p className={`${styles.label} studio-label studio-eyebrow`}>{text('eyebrow')}</p>
          <h1>
            <span>{text('emphasis')}</span>
            {text('title')}
          </h1>
          <div className={styles.intro}>
            <p>{text('intro')}</p>
            <div className={`${styles.actions} studio-actions`}>
              <a className="studio-button" href="#courses">
                {text('course-action')}
              </a>
              <InquiryButton className="studio-button-outline">
                {text('inquiry-action')}
              </InquiryButton>
            </div>
          </div>
          <nav className={styles.jump} aria-label="Розділи академії">
            <a data-site-field="courses" href="#courses">
              {text('courses')}
            </a>
            <a data-site-field="workshops" href="#workshops">
              {text('workshops')}
            </a>
            <a data-site-field="individual" href="#individual">
              {text('individual')}
            </a>
            <a data-site-field="corporate" href="#corporate">
              {text('corporate')}
            </a>
            <a data-site-field="camp" href="#camp">
              {text('camp')}
            </a>
            <a data-site-field="lecturers" href="#lecturers">
              {text('lecturers')}
            </a>
          </nav>
        </div>
      </section>
      <StudioAcademyPrograms
        page={page}
        additionalPages={additionalPages}
        programs={content.programs}
        offerings={content.offerings}
        images={content.images}
      />
      <StudioAcademyCommunity page={page} />
      <StudioInquirySection
        title={text('inquiry-title')}
        hand={text('inquiry-emphasis')}
        description={text('inquiry-description')}
        layout="balanced"
      />
      <StudioMobileAction>
        <a className="studio-button" href="#courses">
          {text('course-action')}
        </a>
      </StudioMobileAction>
    </>
  );
}
