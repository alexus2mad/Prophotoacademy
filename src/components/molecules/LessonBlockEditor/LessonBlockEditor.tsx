'use client';
import { useLessonBlockEditor } from './hooks';
import type { LessonBlockEditorProps } from './types';
export function LessonBlockEditor(props: LessonBlockEditorProps) {
  const { block, onChange, onDelete, onMove, first, last } = props,
    h = useLessonBlockEditor(props);
  const names = {
    article: 'Текст',
    video: 'Відео',
    image: 'Зображення',
    pdf: 'PDF',
    file: 'Додатковий файл',
    zoom: 'Зустріч Zoom',
  };
  return (
    <section className="editor-block">
      <header>
        <h3>{names[block.kind]}</h3>
        <button
          type="button"
          className="editor-icon-control"
          disabled={first}
          onClick={() => onMove(-1)}
          aria-label="Перемістити блок вище"
        >
          ↑
        </button>
        <button
          type="button"
          className="editor-icon-control"
          disabled={last}
          onClick={() => onMove(1)}
          aria-label="Перемістити блок нижче"
        >
          ↓
        </button>
        <button
          type="button"
          className="editor-icon-control"
          onClick={onDelete}
          aria-label="Видалити блок"
        >
          ×
        </button>
      </header>
      <label>
        Заголовок матеріалу
        <input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          maxLength={160}
        />
      </label>
      <label className="inline-check">
        <input
          type="checkbox"
          checked={block.required}
          onChange={(e) => onChange({ required: e.target.checked })}
        />
        Обов’язковий для завершення уроку
      </label>
      {block.kind === 'article' ? (
        <>
          <div className="editor-format-toolbar" aria-label="Форматування тексту">
            <button type="button" onClick={() => h.markdown('**', '**')}>
              Жирний
            </button>
            <button type="button" onClick={() => h.markdown('## ')}>
              Заголовок
            </button>
            <button type="button" onClick={() => h.markdown('- ')}>
              Список
            </button>
            <button type="button" onClick={() => h.markdown('[', '](https://)')}>
              Посилання
            </button>
          </div>
          <label>
            Текст уроку
            <textarea
              ref={h.text}
              value={block.body || ''}
              onChange={(e) => onChange({ body: e.target.value })}
              rows={10}
            />
          </label>
          <p className="admin-muted">
            Підтримується Markdown: заголовки, списки, посилання та виділення тексту
          </p>
        </>
      ) : block.kind === 'zoom' ? (
        <p className="admin-muted">
          Дату, групу та посилання налаштуйте в розкладі після публікації уроку
        </p>
      ) : (
        <>
          <label>
            Файл
            <input
              type="file"
              disabled={h.uploading}
              accept={
                block.kind === 'video'
                  ? 'video/*'
                  : block.kind === 'image'
                    ? 'image/jpeg,image/png,image/webp'
                    : 'application/pdf'
              }
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void h.upload(file);
              }}
            />
          </label>
          {block.mediaId && (
            <p className="admin-muted">
              Матеріал прикріплено{block.duration ? ` · ${Math.round(block.duration / 60)} хв` : ''}
              {block.pageSeconds ? ` · ${block.pageSeconds.length} сторінок` : ''}
            </p>
          )}
          {block.kind === 'video' && block.mediaId && (
            <button
              className="button button-secondary"
              type="button"
              disabled={h.busy}
              onClick={h.check}
            >
              Перевірити готовність
            </button>
          )}
          {h.uploadMessage && <p role="status">{h.uploadMessage}</p>}
          {h.error && (
            <p className="learning-error" role="alert">
              {h.error}
            </p>
          )}
        </>
      )}
      {block.kind === 'image' && (
        <>
          <label>
            Опис для людей, які не бачать зображення
            <input
              value={block.alt || ''}
              onChange={(e) => onChange({ alt: e.target.value })}
              maxLength={500}
            />
          </label>
          <label>
            Підпис до фотографії
            <input
              value={block.caption || ''}
              onChange={(e) => onChange({ caption: e.target.value })}
              maxLength={1000}
            />
          </label>
        </>
      )}
      <label>
        Очікуваний час опрацювання, секунд
        <input
          type="number"
          min={1}
          max={86400}
          placeholder="Автоматично"
          value={block.expectedSeconds || ''}
          onChange={(e) =>
            onChange({ expectedSeconds: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </label>
    </section>
  );
}
