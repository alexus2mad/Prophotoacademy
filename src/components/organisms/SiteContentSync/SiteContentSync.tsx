'use client';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { SiteSyncChanges } from '@/components/molecules/SiteSyncChanges/SiteSyncChanges';
import { stagingPageHref } from '@/lib/site-editor/sync/links';
import { useSiteContentSync } from './hooks';
import type { SiteContentSyncProps } from './types';
import styles from './SiteContentSync.module.css';

const price = new Intl.NumberFormat('uk-UA');

export function SiteContentSync(props: SiteContentSyncProps) {
  const h = useSiteContentSync(props);
  const candidates = h.overview?.candidates ?? [];
  const publishing = h.task?.kind === 'publish';

  return (
    <section className={styles.sync} aria-labelledby="site-sync-heading" aria-busy={h.loading}>
      <button type="button" className={styles.back} onClick={props.onClose} disabled={publishing}>
        <ArrowLeft size={17} aria-hidden="true" /> Сторінки сайту
      </button>
      <header className={styles.header}>
        <div>
          <h1 id="site-sync-heading" ref={h.heading} tabIndex={-1}>
            Зміни зі staging
          </h1>
          <p>
            Опубліковані на staging сторінки, яких немає на проді або які відрізняються. Публікація
            одразу оновлює сторінку на сайті
          </p>
        </div>
        <Button
          className="button button-secondary"
          disabled={h.loading || publishing}
          onClick={h.reload}
        >
          <RefreshCw size={17} aria-hidden="true" /> Оновити
        </Button>
      </header>
      <p role="status" className={styles.status}>
        {h.loading
          ? 'Порівнюємо зі staging…'
          : h.message ||
            (h.overview &&
              (candidates.length
                ? 'Відрізняється: ' + candidates.length + ' · Однакових: ' + h.overview.identical
                : 'Усі сторінки збігаються зі staging · ' + h.overview.identical))}
      </p>
      {h.error && (
        <p role="alert" className={styles.error}>
          {h.error}
        </p>
      )}
      <ul className={styles.list} aria-label="Сторінки, що відрізняються від staging">
        {candidates.map((c) => {
          const confirming = h.task?.path === c.path;
          return (
            <li key={c.path} className={styles.item} data-focused={c.path === props.focusPath}>
              <div className={styles.itemHead}>
                <div>
                  <span className={styles.badge} data-status={c.status}>
                    {c.status === 'new' ? 'Нова' : 'Змінена'}
                  </span>
                  <h2>{c.title}</h2>
                  <p className={styles.path}>{c.path}</p>
                </div>
                <a
                  href={stagingPageHref(c.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={'Переглянути «' + c.title + '» на staging (нова вкладка)'}
                >
                  Переглянути на staging <ExternalLink size={15} aria-hidden="true" />
                </a>
              </div>
              <SiteSyncChanges candidate={c} />
              <ul className={styles.notes}>
                {c.photos > 0 && <li>Фото для копіювання на прод: {c.photos}</li>}
                {c.productionDraft && (
                  <li data-tone="warning">
                    На проді є збережена чернетка цієї сторінки. Публікація її замінить
                  </li>
                )}
                {c.ticket && (
                  <li data-tone="warning">
                    Квиток «{c.ticket.label}» за {price.format(c.ticket.price)} грн продаватиметься
                    через живу оплату WayForPay на проді
                  </li>
                )}
                {c.status === 'changed' && (
                  <li>Поточна версія на проді буде замінена версією зі staging</li>
                )}
              </ul>
              {c.problem ? (
                <p role="alert" className={styles.error}>
                  {c.problem}
                </p>
              ) : confirming ? (
                <div
                  className={styles.confirm}
                  role="group"
                  aria-label={'Підтвердження: ' + c.title}
                >
                  <p>Опублікувати «{c.title}» на prophotoacademy.com.ua зараз?</p>
                  <div className={styles.actions}>
                    <Button disabled={publishing} onClick={() => h.publish(c.path)}>
                      {publishing ? 'Публікуємо…' : 'Так, опублікувати на проді'}
                    </Button>
                    <Button
                      className="button button-secondary"
                      disabled={publishing}
                      onClick={h.cancel}
                    >
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={styles.actions}>
                  <Button disabled={h.loading || !!h.task} onClick={() => h.confirm(c.path)}>
                    Опублікувати на проді
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
