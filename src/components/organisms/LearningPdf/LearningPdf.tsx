'use client';
import { useLearningPdf } from './hooks';
import type { LearningPdfProps } from './types';
export function LearningPdf(props: LearningPdfProps) {
  const { block, url } = props;
  const { canvas, container, page, setPage, scale, setScale, count, text, error, ready } =
    useLearningPdf(props);
  return (
    <section
      ref={container}
      data-reading-block
      className="lesson-block lesson-pdf"
      aria-label={block.title}
    >
      <h2>{block.title}</h2>
      <div className="pdf-toolbar" role="group" aria-label="Керування PDF">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          aria-label="Попередня сторінка"
        >
          Назад
        </button>
        <span aria-live="polite">{count ? `${page + 1} / ${count}` : 'Завантаження…'}</span>
        <button
          type="button"
          disabled={!count || page >= count - 1}
          onClick={() => setPage(page + 1)}
          aria-label="Наступна сторінка"
        >
          Далі
        </button>
        <button
          type="button"
          onClick={() => setScale(scale >= 1.5 ? 1 : 1.5)}
          aria-label={scale > 1 ? 'Зменшити сторінку' : 'Збільшити сторінку'}
        >
          {scale > 1 ? '100%' : '150%'}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Завантажити PDF
        </a>
      </div>
      {error ? (
        <p className="learning-error" role="alert">
          {error}
        </p>
      ) : (
        <>
          <div
            className="pdf-sheet"
            tabIndex={0}
            role="region"
            aria-label={`Сторінка ${page + 1}. Текст доступний нижче`}
          >
            <canvas ref={canvas} />
          </div>
          {!ready && (
            <p className="learning-status" role="status">
              Готуємо сторінку…
            </p>
          )}
          <details className="pdf-text-toggle">
            <summary>Текст поточної сторінки</summary>
            <div className="pdf-text-content" tabIndex={0}>
              {text ||
                'Ця сторінка складається із зображень. Для доступного формату зверніться до викладача'}
            </div>
          </details>
        </>
      )}
      <p className="learning-meta">
        Завантаження файлу не змінює прогрес. Після роботи офлайн скористайтеся підтвердженням унизу
        уроку
      </p>
    </section>
  );
}
