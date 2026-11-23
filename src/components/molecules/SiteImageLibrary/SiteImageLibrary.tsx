'use client';
import Image from 'next/image';
import { Check, Search, Upload, X } from 'lucide-react';
import type { ImageSource } from '@/lib/site-editor/image-library/types';
import { useSiteImageLibrary } from './hooks';
import type { SiteImageLibraryProps } from './types';
import styles from './SiteImageLibrary.module.css';

const sources: [ImageSource, string][] = [
  ['all', 'Усі'],
  ['uploads', 'Завантажені'],
  ['academy', 'Фото академії'],
];

export function SiteImageLibrary({ current, onChoose, onClose }: SiteImageLibraryProps) {
  const ui = useSiteImageLibrary();
  return (
    <dialog
      ref={ui.dialog}
      className={styles.dialog}
      aria-labelledby="site-image-library-title"
      onClose={onClose}
    >
      <div className={styles.layout}>
        <header className={styles.header}>
          <h2 id="site-image-library-title">Бібліотека зображень</h2>
          <button
            className={styles.icon}
            type="button"
            aria-label="Закрити бібліотеку"
            onClick={() => ui.dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        <div className={styles.tools}>
          <label className={styles.search}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label="Знайти зображення"
              placeholder="Знайти зображення"
              maxLength={120}
              value={ui.query}
              onChange={(e) => ui.setQuery(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={styles.upload}
            disabled={ui.uploading}
            onClick={() => ui.input.current?.click()}
          >
            <Upload size={17} aria-hidden="true" />
            {ui.uploading ? 'Завантажуємо…' : 'Завантажити файл'}
          </button>
          <input
            ref={ui.input}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp,image/avif"
            aria-label="Файл зображення"
            onChange={(e) => void ui.upload(e.target.files?.[0])}
          />
        </div>
        <div className={styles.filters} role="group" aria-label="Джерело зображень">
          {sources.map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={ui.source === value}
              onClick={() => ui.setSource(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.scroll} aria-busy={ui.loading}>
          {ui.error && (
            <p role="alert" className={styles.error}>
              {ui.error}{' '}
              <button type="button" onClick={ui.retry}>
                Спробувати ще раз
              </button>
            </p>
          )}
          {ui.loading ? (
            <p role="status">Завантажуємо бібліотеку…</p>
          ) : !ui.error && !ui.result.total ? (
            <p role="status">
              {ui.query ? 'За цим запитом зображень не знайдено' : 'Тут ще немає зображень'}
            </p>
          ) : null}
          <ul className={styles.grid} aria-label="Зображення">
            {ui.result.images.map((asset) => {
              const chosen = ui.selected?.url === asset.url;
              return (
                <li key={asset.url}>
                  <button
                    type="button"
                    aria-pressed={chosen}
                    aria-label={asset.name + ' · ' + asset.context}
                    onClick={() => ui.select(asset)}
                  >
                    <span className={styles.thumb}>
                      <Image
                        src={asset.url}
                        alt=""
                        width={256}
                        height={176}
                        sizes="(max-width: 580px) 42vw, 180px"
                      />
                      {chosen && (
                        <span className={styles.check}>
                          <Check size={16} />
                        </span>
                      )}
                    </span>
                    <strong>{asset.name}</strong>
                    <small>{asset.url === current ? 'Використовується тут' : asset.context}</small>
                  </button>
                </li>
              );
            })}
          </ul>
          {ui.result.next !== null && (
            <button className={styles.more} type="button" disabled={ui.more} onClick={ui.loadMore}>
              {ui.more ? 'Завантажуємо…' : 'Показати ще'}
            </button>
          )}
        </div>
        <footer className={styles.footer}>
          <span aria-live="polite">{ui.selected?.name || 'Оберіть зображення'}</span>
          <button
            className={styles.apply}
            type="button"
            disabled={!ui.selected || ui.uploading}
            onClick={() => {
              if (ui.selected) onChoose(ui.selected.url);
            }}
          >
            Вставити зображення
          </button>
        </footer>
      </div>
    </dialog>
  );
}
