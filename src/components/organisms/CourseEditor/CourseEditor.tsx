'use client';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { LessonBlockEditor } from '@/components/molecules/LessonBlockEditor/LessonBlockEditor';
import { CoursePackageEditor } from '@/components/organisms/CoursePackageEditor/CoursePackageEditor';
import { CourseSessions } from '@/components/organisms/CourseSessions/CourseSessions';
import { useCourseEditor } from './hooks';
import type { CourseEditorProps } from './types';
import type { LearningBlock } from '@/lib/learning/types';
export function CourseEditor(props: CourseEditorProps) {
  const h = useCourseEditor(props);
  return (
    <>
      <div className="workspace-page-heading">
        <div>
          <p className="admin-muted">Чернетка курсу</p>
          <h1>{h.draft.title}</h1>
        </div>
        <div className="admin-inline-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={h.save}
            disabled={h.busy}
          >
            {h.dirty ? 'Зберегти зміни' : 'Зберегти'}
          </button>
          <button
            type="button"
            className="button"
            onClick={() => h.publishDialog.current?.showModal()}
            disabled={h.busy || h.dirty}
          >
            Опублікувати
          </button>
        </div>
      </div>
      {h.error && (
        <p className="learning-error" role="alert">
          {h.error}
        </p>
      )}
      {h.message && (
        <p className="learning-success" role="status">
          {h.message}
        </p>
      )}
      <p className="admin-muted">
        {h.dirty ? 'Є незбережені зміни' : 'Чернетка збережена'} · Опубліковані версії не змінюються
        для наявних студентів
      </p>
      <div className="admin-editor">
        <aside className="editor-outline" aria-label="Структура курсу">
          {h.draft.modules.map((module, mi) => (
            <section key={module.id}>
              <label>
                Модуль
                <input
                  value={module.title}
                  onChange={(e) =>
                    h.update({
                      ...h.draft,
                      modules: h.draft.modules.map((m) =>
                        m.id === module.id ? { ...m, title: e.target.value } : m,
                      ),
                    })
                  }
                />
              </label>
              <div className="editor-format-toolbar">
                <button
                  type="button"
                  disabled={mi === 0}
                  onClick={() => h.moveModule(module.id, -1)}
                >
                  Вище
                </button>
                <button
                  type="button"
                  disabled={mi === h.draft.modules.length - 1}
                  onClick={() => h.moveModule(module.id, 1)}
                >
                  Нижче
                </button>
              </div>
              <ol>
                {module.lessons.map((l, i) => (
                  <li
                    key={l.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', l.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const source = e.dataTransfer.getData('text/plain'),
                        from = module.lessons.findIndex((item) => item.id === source);
                      if (from >= 0) h.moveLesson(module.id, source, i - from);
                    }}
                  >
                    <button
                      type="button"
                      className={h.activeId === l.id ? 'is-active' : ''}
                      onClick={() => h.setActiveId(l.id)}
                    >
                      {l.title}
                    </button>
                    <button
                      type="button"
                      className="reorder-control"
                      aria-label={`Перемістити ${l.title} вище`}
                      disabled={i === 0}
                      onClick={() => h.moveLesson(module.id, l.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="reorder-control"
                      aria-label={`Перемістити ${l.title} нижче`}
                      disabled={i === module.lessons.length - 1}
                      onClick={() => h.moveLesson(module.id, l.id, 1)}
                    >
                      ↓
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" onClick={() => h.addLesson(module.id)}>
                Додати урок
              </button>
            </section>
          ))}
          <button type="button" className="button button-secondary" onClick={h.addModule}>
            Додати модуль
          </button>
        </aside>
        <div className="editor-content">
          {h.active ? (
            <>
              <div className="admin-form">
                <label>
                  Назва уроку
                  <input
                    value={h.active.title}
                    onChange={(e) => h.lesson({ title: e.target.value })}
                  />
                </label>
                <label>
                  Короткий опис
                  <textarea
                    value={h.active.summary}
                    onChange={(e) => h.lesson({ summary: e.target.value })}
                    rows={2}
                  />
                </label>
                <div className="admin-form-row">
                  <label>
                    Відкрити з, UTC
                    <input
                      type="datetime-local"
                      value={h.active.releaseAt?.slice(0, 16) || ''}
                      onChange={(e) =>
                        h.lesson({
                          releaseAt: e.target.value
                            ? new Date(e.target.value + 'Z').toISOString()
                            : undefined,
                        })
                      }
                    />
                  </label>
                  <label className="inline-check">
                    <input
                      type="checkbox"
                      checked={!!h.active.introductory}
                      onChange={(e) => h.lesson({ introductory: e.target.checked })}
                    />
                    Вступний урок доступний до початку набору
                  </label>
                </div>
              </div>
              <div className="admin-inline-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => h.setPreview(!h.preview)}
                >
                  {h.preview ? 'Редагувати' : 'Переглянути текст'}
                </button>
                {props.data.releases[0] && (
                  <Link
                    href={
                      (props.demo ? '/demo' : '') +
                      '/admin/courses/' +
                      h.draft.id +
                      '/preview/' +
                      h.active.id
                    }
                    className="button button-secondary"
                  >
                    Перегляд студента
                  </Link>
                )}
              </div>
              {h.preview ? (
                <div className="lesson-prose admin-panel admin-section">
                  {h.active.blocks
                    .filter((b) => b.kind === 'article')
                    .map((b) => (
                      <section key={b.id}>
                        <h2>{b.title}</h2>
                        <ReactMarkdown skipHtml disallowedElements={['img']}>
                          {b.body || ''}
                        </ReactMarkdown>
                      </section>
                    ))}
                </div>
              ) : (
                h.active.blocks.map((block, index) => (
                  <LessonBlockEditor
                    key={block.id}
                    block={block}
                    courseId={h.draft.id}
                    demo={props.demo}
                    onChange={(change) => h.block(block.id, change)}
                    onDelete={() =>
                      h.lesson({ blocks: h.active!.blocks.filter((b) => b.id !== block.id) })
                    }
                    onMove={(direction) => h.moveBlock(block.id, direction)}
                    first={index === 0}
                    last={index === h.active!.blocks.length - 1}
                  />
                ))
              )}
              <label className="admin-form">
                Додати матеріал
                <select
                  value=""
                  onChange={(e) => h.addBlock(e.target.value as LearningBlock['kind'])}
                >
                  <option value="">Оберіть тип</option>
                  <option value="article">Текст</option>
                  <option value="video">Відео</option>
                  <option value="image">Зображення</option>
                  <option value="pdf">PDF</option>
                  <option value="file">Додатковий PDF-файл</option>
                  <option value="zoom">Зустріч Zoom</option>
                </select>
              </label>
            </>
          ) : (
            <div className="workspace-empty">Додайте або оберіть урок</div>
          )}
        </div>
      </div>
      <CoursePackageEditor courseId={h.draft.id} data={props.data} demo={props.demo} />
      <CourseSessions courseId={h.draft.id} data={props.data} demo={props.demo} />
      <dialog ref={h.publishDialog} className="admin-dialog" aria-labelledby="publish-title">
        <h2 id="publish-title">Опублікувати нову версію</h2>
        <p>
          Ця версія стане доступною для налаштування нових пакетів. Студенти з поточним доступом
          залишаться на призначеній їм версії, доки ви явно не зміните її
        </p>
        <div className="admin-inline-actions">
          <button type="button" className="button" onClick={h.publish}>
            Опублікувати версію
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => h.publishDialog.current?.close()}
          >
            Повернутися до редагування
          </button>
        </div>
      </dialog>
    </>
  );
}
