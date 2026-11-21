'use client';
import { shopSelection, equipmentCategories } from '@/lib/site-editor/brand/shop/selection';
import { bindSection } from '@/lib/site-editor/bind-section';

import { StudioInquiryForm } from '@/components/organisms/StudioInquiryForm/StudioInquiryForm';
import { useStudioShopSelection } from './hooks';
import type { StudioShopSelectionProps } from './types';
import styles from './StudioShopSelection.module.css';

export function StudioShopSelection({ page, shopUrl }: StudioShopSelectionProps) {
  const { text } = bindSection(page, shopSelection);
  const { selection, toggle, topic } = useStudioShopSelection();
  return (
    <section id="equipment-selection" className="studio-band studio-light">
      <div className={`${styles.grid} studio-wrap`}>
        <div className={styles.copy}>
          <p className="studio-label studio-eyebrow">{text('eyebrow')}</p>
          <h2 className="studio-title">
            {text('title')} <span className="studio-hand">{text('emphasis')}</span>
          </h2>
          <p className="studio-lead">{text('intro')}</p>
          <fieldset>
            <legend className="studio-label studio-eyebrow">{text('legend')}</legend>
            <div className={styles.chips}>
              {equipmentCategories.map((_, i) => {
                const item = text('category-' + i);
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selection.includes(item)}
                    onClick={() => toggle(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </fieldset>
          {shopUrl && (
            <a className={styles.shopLink} href={shopUrl}>
              {text('shop-action')}
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
