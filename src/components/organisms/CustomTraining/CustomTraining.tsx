import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
export function CustomTraining() {
  return (
    <section className="editorial-section custom-editorial container" data-editorial-reveal>
      <div className="custom-intro">
        <h2>Навчання під ваші цілі</h2>
        <p>
          Коли готова програма не відповідає вашому запиту, створюємо навчання навколо конкретних
          завдань.
        </p>
      </div>
      <div className="custom-editorial-grid">
        <article>
          <h3>Індивідуальне навчання</h3>
          <p>Фото, відео або контент. Особиста програма і робота з викладачем.</p>
          <InquiryButton
            programId="program-individual"
            title="Ваш особистий формат"
            className="text-link"
          >
            Обговорити програму
          </InquiryButton>
        </article>
        <article>
          <h3>Навчання для команди</h3>
          <p>Навички фото й відео на реальних завданнях вашого бренду.</p>
          <InquiryButton
            programId="program-corporate"
            title="Навчання для вашої команди"
            className="text-link"
          >
            Навчити команду
          </InquiryButton>
        </article>
      </div>
    </section>
  );
}
