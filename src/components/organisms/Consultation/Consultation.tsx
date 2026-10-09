'use client';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';

export function Consultation() {
  return (
    <section className="consultation-field">
      <div className="container consultation">
        <div>
          <h2>Допоможемо обрати програму</h2>
          <p>
            Розкажіть, що хочете створювати.
            <br />
            Знайдемо програму і формат разом.
          </p>
        </div>
        <InquiryButton className="button">Поговорімо про навчання</InquiryButton>
      </div>
    </section>
  );
}
