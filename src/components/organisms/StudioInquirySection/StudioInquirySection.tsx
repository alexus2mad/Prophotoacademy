import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { StudioInquiryForm } from '@/components/organisms/StudioInquiryForm/StudioInquiryForm';
import type { StudioInquirySectionProps } from './types';
import styles from './StudioInquirySection.module.css';

export function StudioInquirySection({
  title,
  hand,
  description = 'Заповніть форму та отримайте безкоштовну консультацію з нашим спеціалістом.',
  context,
  layout = 'editorial',
  children,
  identifiers,
}: StudioInquirySectionProps) {
  return (
    <section
      data-site-section={identifiers?.section}
      className={`studio-band studio-wrap studio-light ${styles.section} ${layout === 'balanced' ? styles.balanced : ''}`}
    >
      <div className={styles.copy}>
        <h2 className="studio-title">
          {identifiers ? <SiteCopy id={identifiers.title}>{title}</SiteCopy> : title}
          {hand && (
            <>
              <br />
              <span className="studio-hand">
                *{identifiers ? <SiteCopy id={identifiers.hand}>{hand}</SiteCopy> : hand}
              </span>
            </>
          )}
        </h2>
        <p data-site-field={identifiers?.description} className="studio-lead">
          {description}
        </p>
        {children}
      </div>
      <StudioInquiryForm context={context} compact={layout === 'balanced'} />
    </section>
  );
}
