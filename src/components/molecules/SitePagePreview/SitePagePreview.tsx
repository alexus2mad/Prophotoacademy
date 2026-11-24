'use client';
import { environmentLabels } from '@/lib/site-editor/environments';
import { useSitePagePreview } from './hooks';
import type { SitePagePreviewProps } from './types';
import styles from './SitePagePreview.module.css';

export function SitePagePreview(props: SitePagePreviewProps) {
  const h = useSitePagePreview(props);
  const versionLabel = h.version === 'draft' ? 'Збережена чернетка' : 'Опублікована версія';
  return (
    <section className={styles.preview} aria-label={'Перегляд: ' + props.title}>
      <div className={styles.bar}>
        <div className={styles.segment} role="group" aria-label="Ширина перегляду">
          {(['desktop', 'phone'] as const).map((device) => (
            <button
              key={device}
              type="button"
              aria-pressed={h.device === device}
              onClick={() => h.setDevice(device)}
            >
              {device === 'desktop' ? 'Комп’ютер' : 'Телефон'}
            </button>
          ))}
        </div>
        {h.comparable && (
          <div className={styles.segment} role="group" aria-label="Версія сторінки">
            {(['draft', 'published'] as const).map((version) => (
              <button
                key={version}
                type="button"
                aria-pressed={h.version === version}
                onClick={() => h.setVersion(version)}
              >
                {version === 'draft' ? 'Чернетка' : 'Опубліковано'}
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={h.stage} className={styles.stage} data-device={h.device}>
        <iframe
          key={h.src}
          title={'Перегляд сторінки ' + props.title}
          src={h.src}
          sandbox="allow-same-origin"
          tabIndex={-1}
          onLoad={h.onLoad}
          style={{
            width: h.frame.width,
            height: h.frame.height,
            transform: 'translateX(-50%) scale(' + h.frame.scale + ')',
          }}
        />
        {h.loading && (
          <p className={styles.loading} role="status">
            Завантажуємо перегляд…
          </p>
        )}
        <span className={styles.tag}>
          {environmentLabels[props.target]} · {versionLabel}
        </span>
      </div>
    </section>
  );
}
