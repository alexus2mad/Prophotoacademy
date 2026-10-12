'use client';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useLessonBlockEditor } from './hooks';
import { QuizEditor } from '@/components/molecules/QuizEditor/QuizEditor';
import { LessonProse } from '@/components/molecules/LessonProse/LessonProse';
import { EditorMediaPreview } from '@/components/organisms/EditorMediaPreview/EditorMediaPreview';
import { IconButton } from '@/components/atoms/IconButton/IconButton';
import { materialNames } from '@/lib/learning/editor';
import { readingFont } from '@/lib/typography/fonts';
import type { LessonBlockEditorProps } from './types';

export function LessonBlockEditor(props: LessonBlockEditorProps) {
  const { block, onChange, onDelete, onMove, first, last } = props;
  const h = useLessonBlockEditor(props);
  const hasMedia = ['image', 'video', 'pdf', 'file'].includes(block.kind);
  return (
    <section
      className="material-editor"
      aria-label={`Редактор матеріалу: ${materialNames[block.kind]}`}
    >
      <header className="material-editor-heading">
        <h3>{materialNames[block.kind]}</h3>
        <div className="material-editor-actions">
          <IconButton
            aria-label="Перемістити блок вище"
            disabled={first || h.uploading}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={18} />
          </IconButton>
          <IconButton
            aria-label="Перемістити блок нижче"
            disabled={last || h.uploading}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={18} />
          </IconButton>
          <IconButton
            aria-label="Видалити блок"
            disabled={h.uploading}
            onClick={() => h.setDeleteOpen(!h.deleteOpen)}
          >
            <Trash2 size={18} />
          </IconButton>
        </div>
      </header>
      {h.deleteOpen && (
        <div
          className="material-delete-confirm"
          role="group"
          aria-label="Підтвердження видалення матеріалу"
        >
          <p>Прибрати матеріал із чернетки? Опубліковані версії залишаться без змін</p>
          <div className="admin-inline-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => h.setDeleteOpen(false)}
            >
              Залишити
            </button>
            <button type="button" className="button" onClick={onDelete}>
              Прибрати з чернетки
            </button>
          </div>
        </div>
      )}
      {hasMedia && (block.mediaId || block.youtubeUrl) && (
        <EditorMediaPreview
          key={`${block.mediaId || block.id}-${h.previewVersion}`}
          block={block}
          courseId={props.courseId}
          demo={props.demo}
        />
      )}
      <div className="material-editor-fields">
        <label>
          Заголовок матеріалу
          <input
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value })}
            maxLength={160}
            placeholder={
              block.kind === 'image' ? 'Необов’язковий для зображення' : 'Назва матеріалу'
            }
          />
        </label>
        {block.kind === 'quiz' ? (
          <QuizEditor
            quiz={block.quiz || { passingScore: 80, questions: [] }}
            onChange={(quiz) => onChange({ quiz })}
          />
        ) : block.kind === 'article' ? (
          <>
            <div className="material-text-controls">
              <label>
                Оформлення
                <select
                  value={block.presentation || 'reading'}
                  onChange={(e) =>
                    onChange({ presentation: e.target.value as 'reading' | 'practice' })
                  }
                >
                  <option value="reading">Основний текст</option>
                  <option value="practice">Практичне завдання</option>
                </select>
              </label>
              <button
                type="button"
                className="button button-secondary"
                aria-pressed={h.textPreview}
                onClick={() => h.setTextPreview(!h.textPreview)}
              >
                {h.textPreview ? 'Редагувати текст' : 'Переглянути текст'}
              </button>
            </div>
            {h.textPreview ? (
              <div className={`${readingFont.variable} lesson-content editor-text-preview`}>
                <LessonProse>{block.body || 'Тут з’явиться ваш текст'}</LessonProse>
              </div>
            ) : (
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
                    rows={12}
                  />
                </label>
              </>
            )}
          </>
        ) : block.kind === 'zoom' ? (
          <p className="admin-muted">
            Після публікації уроку відкрийте розділ «Зустрічі», щоб додати дату, групу та посилання
            Zoom
          </p>
        ) : (
          <>
            {block.kind === 'video' && (
              <label>
                Посилання YouTube
                <input
                  type="url"
                  placeholder="https://youtu.be/…"
                  value={block.youtubeUrl || ''}
                  onChange={(e) =>
                    onChange({
                      youtubeUrl: e.target.value || undefined,
                      ...(e.target.value
                        ? { mediaId: undefined, duration: undefined, required: false }
                        : {}),
                    })
                  }
                />
                <span className="admin-muted">
                  Додатковий запис без відстеження перегляду. Для захищеного відео завантажте файл
                </span>
              </label>
            )}
            {!block.youtubeUrl && (
              <div className="material-upload">
                <label className="material-upload-label">
                  <span>{block.mediaId ? 'Замінити файл' : 'Завантажити файл'}</span>
                  <input
                    type="file"
                    className="sr-only"
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
                      e.target.value = '';
                    }}
                  />
                </label>
                <p className="admin-muted">
                  {block.kind === 'image'
                    ? 'JPEG, PNG або WebP · до 50 МБ'
                    : block.kind === 'video'
                      ? 'Відео стане доступним після обробки'
                      : 'PDF · до 50 МБ'}
                  {block.duration ? ` · ${Math.round(block.duration / 60)} хв` : ''}
                  {block.pageSeconds ? ` · ${block.pageSeconds.length} сторінок` : ''}
                </p>
                {block.mediaId && (
                  <button
                    type="button"
                    className="editor-icon-control"
                    disabled={h.busy || h.uploading}
                    onClick={h.check}
                  >
                    Оновити готовність
                  </button>
                )}
                {h.uploadMessage && (
                  <p className="material-upload-status" role="status">
                    {h.uploadMessage}
                  </p>
                )}
                {h.error && (
                  <div>
                    <p className="learning-error" role="alert">
                      {h.error}
                    </p>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={h.uploading}
                      onClick={h.retry}
                    >
                      Повторити завантаження
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {block.kind === 'image' && (
          <>
            <label>
              Підпис до фотографії
              <textarea
                rows={2}
                value={block.caption || ''}
                onChange={(e) => onChange({ caption: e.target.value })}
                maxLength={1000}
              />
            </label>
            <label>
              Альтернативний опис
              <input
                value={block.alt || ''}
                onChange={(e) => onChange({ alt: e.target.value })}
                maxLength={500}
              />
              <span className="admin-muted">
                Опишіть, що зображено, для людей, які користуються читачем екрана
              </span>
            </label>
          </>
        )}
        <details className="material-completion-settings">
          <summary>
            Участь у прогресі уроку <span>{block.required ? 'Обов’язковий' : 'Додатковий'}</span>
          </summary>
          <label className="inline-check">
            <input
              type="checkbox"
              checked={block.required}
              disabled={!!block.youtubeUrl}
              onChange={(e) => onChange({ required: e.target.checked })}
            />
            Обов’язковий для завершення уроку
          </label>
          <label>
            Очікуваний час опрацювання, секунд
            <input
              type="number"
              min={1}
              max={86400}
              placeholder="Визначається автоматично"
              value={block.expectedSeconds || ''}
              onChange={(e) =>
                onChange({ expectedSeconds: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </label>
        </details>
      </div>
    </section>
  );
}
