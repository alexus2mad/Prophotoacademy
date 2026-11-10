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
}: StudioInquirySectionProps) {
  return (
    <section
      className={`studio-band studio-wrap studio-light ${styles.section} ${layout === 'balanced' ? styles.balanced : ''}`}
    >
      <div className={styles.copy}>
        <h2 className="studio-title">
          {title}
          {hand && (
            <>
              <br />
              <span className="studio-hand">*{hand}</span>
            </>
          )}
        </h2>
        <p className="studio-lead">{description}</p>
        {children}
      </div>
      <StudioInquiryForm context={context} />
    </section>
  );
}
