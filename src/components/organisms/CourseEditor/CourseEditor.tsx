'use client';
import Link from 'next/link';
import { LessonBlockEditor } from '@/components/organisms/LessonBlockEditor/LessonBlockEditor';
import { CourseOutline } from '@/components/organisms/CourseOutline/CourseOutline';
import { LessonSettings } from '@/components/molecules/LessonSettings/LessonSettings';
import { MaterialPicker } from '@/components/molecules/MaterialPicker/MaterialPicker';
import { CoursePackageEditor } from '@/components/organisms/CoursePackageEditor/CoursePackageEditor';
import { CourseSessions } from '@/components/organisms/CourseSessions/CourseSessions';
import { hasRequiredMaterial } from '@/lib/learning/presentation';
import { lessonLabel, lessonNumber } from '@/lib/learning/numbering';
import { useCourseEditor } from './hooks';
import type { CourseEditorProps } from './types';

export function CourseEditor(props: CourseEditorProps) {
  const h = useCourseEditor(props);
  const locked = h.busy || h.uploading;
  const blockIndex = h.active?.blocks.findIndex((b) => b.id === h.activeBlock?.id) ?? -1;
  return (
    <div className="course-authoring">
      <div className="authoring-course-heading">
        <a href={(props.demo ? '/demo' : '') + '/admin/courses'}>Усі курси</a>
        <h1>{h.draft.title}</h1>
      </div>
      <div className="authoring-toolbar">
        <nav aria-label="Розділи редактора">
          <button
            type="button"
            aria-pressed={h.section === 'content'}
            disabled={locked}
            onClick={() => h.setSection('content')}
          >
            Матеріали
          </button>
          <button
            type="button"
            aria-pressed={h.section === 'packages'}
            disabled={locked}
            onClick={() => h.setSection('packages')}
          >
            Доступ
          </button>
          <button
            type="button"
            aria-pressed={h.section === 'sessions'}
            disabled={locked}
            onClick={() => h.setSection('sessions')}
          >
            Зустрічі
          </button>
        </nav>
        <div className="authoring-save-actions">
          <span role="status">
            {h.uploading
              ? 'Завантаження матеріалу…'
              : h.busy
                ? 'Зберігаємо…'
                : h.dirty
                  ? 'Є незбережені зміни'
                  : 'Збережено'}
          </span>
          <button
            type="button"
            className="button button-secondary"
            onClick={h.save}
            disabled={locked || !h.dirty}
          >
            Зберегти
          </button>
          <button
            type="button"
            className="button"
            onClick={h.openPublish}
            disabled={locked || h.dirty}
          >
            Опублікувати
          </button>
        </div>
      </div>
      {h.error && (
        <p className="learning-error authoring-notice" role="alert">
          {h.error}
        </p>
      )}
      {h.message && (
        <p className="learning-success authoring-notice" role="status">
          {h.message}
        </p>
      )}
      <div hidden={h.section !== 'content'}>
        <fieldset className="authoring-workspace" disabled={locked}>
          <legend className="sr-only">Редагування навчальних матеріалів</legend>
          <div className="authoring-course-tree">
            <button
              type="button"
              className="authoring-tree-toggle"
              aria-expanded={h.outlineOpen}
              aria-controls="authoring-outline"
              onClick={() => h.setOutlineOpen(!h.outlineOpen)}
            >
              Програма та матеріали <span aria-hidden="true">{h.outlineOpen ? '−' : '+'}</span>
            </button>
            <div id="authoring-outline" hidden={!h.outlineOpen}>
              <CourseOutline
                draft={h.draft}
                activeId={h.activeId}
                activeBlockId={h.activeBlock?.id}
                onLesson={h.setActiveId}
                onBlock={h.setActiveBlockId}
                onModuleTitle={(id, title) =>
                  h.update({
                    ...h.draft,
                    modules: h.draft.modules.map((m) => (m.id === id ? { ...m, title } : m)),
                  })
                }
                onMoveModule={h.moveModule}
                onMoveLesson={h.moveLesson}
                onAddLesson={h.addLesson}
                onAddModule={h.addModule}
              />
            </div>
          </div>
          <div className="authoring-canvas" ref={h.canvas} tabIndex={-1}>
            {h.active ? (
              <>
                <header className="authoring-lesson-heading">
                  <div>
                    <p className="admin-muted">{h.module?.title}</p>
                    <h2>{lessonLabel(h.draft, h.active)}</h2>
                  </div>
                  {!h.dirty && (
                    <Link
                      href={
                        (props.demo ? '/demo' : '') +
                        '/admin/courses/' +
                        h.draft.id +
                        '/preview/' +
                        h.active.id
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-secondary"
                    >
                      Перегляд студента
                    </Link>
                  )}
                </header>
                <LessonSettings
                  key={h.active.id}
                  lesson={h.active}
                  number={lessonNumber(h.draft, h.active.id)}
                  onChange={h.lesson}
                />
                <div className="authoring-material-toolbar">
                  <p>
                    {h.active.blocks.length
                      ? `Матеріал ${blockIndex + 1} з ${h.active.blocks.length}`
                      : 'Урок поки порожній'}
                  </p>
                  <MaterialPicker onAdd={h.addBlock} />
                </div>
                {h.activeBlock ? (
                  <LessonBlockEditor
                    key={h.activeBlock.id}
                    block={h.activeBlock}
                    courseId={h.draft.id}
                    demo={props.demo}
                    onChange={(change) => h.block(h.activeBlock!.id, change)}
                    onDelete={() =>
                      h.lesson({
                        blocks: h.active!.blocks.filter((b) => b.id !== h.activeBlock!.id),
                      })
                    }
                    onMove={(direction) => h.moveBlock(h.activeBlock!.id, direction)}
                    first={blockIndex === 0}
                    last={blockIndex === h.active.blocks.length - 1}
                    onUploadingChange={h.setUploading}
                  />
                ) : (
                  <div className="authoring-empty">
                    <h3>Додайте перший матеріал</h3>
                    <p>Почніть із тексту, зображення або відео. Порядок можна змінити пізніше</p>
                  </div>
                )}
                {h.active.blocks.length > 1 && (
                  <nav className="authoring-material-navigation" aria-label="Навігація матеріалами">
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={blockIndex === 0}
                      onClick={() => h.setActiveBlockId(h.active!.blocks[blockIndex - 1].id)}
                    >
                      Попередній матеріал
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={blockIndex === h.active.blocks.length - 1}
                      onClick={() => h.setActiveBlockId(h.active!.blocks[blockIndex + 1].id)}
                    >
                      Наступний матеріал
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="authoring-empty">
                <h2>Додайте урок до програми</h2>
                <p>Оберіть модуль ліворуч і натисніть «Додати урок»</p>
              </div>
            )}
          </div>
        </fieldset>
      </div>
      <div hidden={h.section !== 'packages'}>
        <CoursePackageEditor courseId={h.draft.id} data={props.data} demo={props.demo} />
      </div>
      <div hidden={h.section !== 'sessions'}>
        <CourseSessions courseId={h.draft.id} data={props.data} demo={props.demo} />
      </div>
      <dialog ref={h.publishDialog} className="admin-dialog" aria-labelledby="publish-title">
        <h2 id="publish-title">Опублікувати нову версію</h2>
        <p>Оберіть уроки, які готові для студентів. Решта залишаться в чернетці</p>
        <fieldset className="publish-lessons">
          <legend>Уроки цієї версії</legend>
          {h.draft.modules
            .flatMap((m) => m.lessons)
            .map((lesson) => (
              <label className="inline-check" key={lesson.id}>
                <input
                  type="checkbox"
                  checked={h.publishedLessons.includes(lesson.id)}
                  disabled={!hasRequiredMaterial(lesson)}
                  onChange={(e) => h.selectPublishedLesson(lesson.id, e.target.checked)}
                />
                <span>
                  {lessonLabel(h.draft, lesson)}
                  {!hasRequiredMaterial(lesson) && <small>Ще немає обов’язкових матеріалів</small>}
                </span>
              </label>
            ))}
        </fieldset>
        <p>Наявні студенти залишаться на призначеній їм версії, доки ви явно не зміните її</p>
        <div className="admin-inline-actions">
          <button
            type="button"
            className="button"
            onClick={h.publish}
            disabled={h.busy || !h.publishedLessons.length}
          >
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
    </div>
  );
}
