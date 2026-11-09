'use client';

import { StudioInquiryForm } from '@/components/organisms/StudioInquiryForm/StudioInquiryForm';
import { useStudioShopSelection } from './hooks';
import type { StudioShopSelectionProps } from './types';
import styles from './StudioShopSelection.module.css';

export function StudioShopSelection({ shopUrl }: StudioShopSelectionProps) {
  const { selection, toggle, topic } = useStudioShopSelection();
  return (
    <section id="equipment-selection" className="studio-band studio-light">
      <div className={`${styles.grid} studio-wrap`}>
        <div className={styles.copy}>
          <p className="studio-label">Обладнання</p>
          <h2 className="studio-title">
            Що <span className="studio-hand">*підібрати?</span>
          </h2>
          <p className="studio-lead">
            Тут ви знайдете всю необхідну техніку для зйомки, яку ми допоможемо підібрати під ваші
            задачі й бюджет.
          </p>
          <fieldset>
            <legend className="studio-label">Оберіть, що потрібно</legend>
            <div className={styles.chips}>
              {['Камера', 'Обʼєктив', 'Світло', 'Мікрофон', 'Штатив', 'Комплект під ключ'].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selection.includes(item)}
                    onClick={() => toggle(item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </fieldset>
          {shopUrl && (
            <a className={styles.shopLink} href={shopUrl}>
              Переглянути обладнання в магазині →
            </a>
          )}
        </div>
        <StudioInquiryForm
          compact
          context={{ title: 'Підбір техніки', source: 'consultation' }}
          id="shop-equipment"
          topic={topic}
        />
      </div>
    </section>
  );
}
