import { StudioInquiryForm } from '@/components/organisms/StudioInquiryForm/StudioInquiryForm';
import type { StudioInquirySectionProps } from './types';
import styles from './StudioInquirySection.module.css';

export function StudioInquirySection({
  title,
  hand,
  description = 'Заповніть форму та отримайте безкоштовну консультацію з нашим спеціалістом.',
  context,
  tone = 'light',
  children,
}: StudioInquirySectionProps) {
  return (
    <section
      className={`studio-band studio-wrap ${tone === 'red' ? `studio-form-red ${styles.balanced}` : 'studio-light'} ${styles.section}`}
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
