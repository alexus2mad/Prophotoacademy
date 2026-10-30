import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import type { ConsultationProps } from './types';

export function Consultation({ compact = false }: ConsultationProps) {
  return (
    <section
      className={compact ? 'consultation-field consultation-field--compact' : 'consultation-field'}
      aria-label="Допомога з вибором навчання"
    >
      <div className="container consultation">
        <div>
          {!compact && <p className="eyebrow">Твоя історія починається з кадру</p>}
          <h2>
            {compact ? (
              'Знайдемо вашу програму'
            ) : (
              <>
                Дозволь собі
                <br />
                <em>більше</em>
              </>
            )}
          </h2>
          <p>Розкажіть, що хочете створювати. Знайдемо програму і формат разом.</p>
        </div>
        <InquiryButton className="button" subject="program-selection" source="consultation">
          Допоможіть обрати
        </InquiryButton>
      </div>
    </section>
  );
}
