'use client';
import Link from 'next/link';
import { CourseCurriculum } from '@/components/molecules/CourseCurriculum/CourseCurriculum';
import { LessonMaterial } from '@/components/organisms/LessonMaterial/LessonMaterial';
import { lessonFraction } from '@/lib/learning/progress';
import { lessonHref } from '@/lib/learning/selectors';
import { useLessonPlayer } from './hooks';
import type { LessonPlayerProps } from './types';
export function LessonPlayer(props: LessonPlayerProps) {
  const { view, demo } = props,
    { progress, status, error, drawer, collapsed, contents, onProgress, confirm } =
      useLessonPlayer(props);
  const complete = lessonFraction(view.lesson, progress) >= 0.999;
  const module = view.enrollment.course.modules.find((m) =>
    m.lessons.some((l) => l.id === view.lesson.id),
  );
  const curriculum = {
    enrollment: view.enrollment,
    lessonId: view.lesson.id,
    currentProgress: progress,
    demo,
  };
  return (
    <div className="lesson-app">
      {demo && (
        <div className="learning-demo-note">
          Демонстрація · навчальні приклади, прогрес зберігається лише в цьому браузері
        </div>
      )}
      <header className="lesson-header">
        <Link href={demo ? '/demo/account' : '/account'}>Мої курси</Link>
        <strong>{view.enrollment.course.title}</strong>
        <button type="button" onClick={contents} aria-label="Показати або приховати зміст курсу">
          Зміст курсу
        </button>
      </header>
      <div className={'lesson-layout' + (collapsed ? ' is-collapsed' : '')}>
        {!collapsed && (
          <aside className="lesson-sidebar" id="course-curriculum" aria-label="Зміст курсу">
            <CourseCurriculum {...curriculum} />
          </aside>
        )}
        <main className="lesson-canvas" id="main">
          <div className="lesson-heading">
            <p className="learning-meta">{module?.title}</p>
            <h1>{view.lesson.title}</h1>
            <p>{view.lesson.summary}</p>
          </div>
          {error && (
            <p role="alert" className="learning-error">
              {error}
            </p>
          )}
          {view.lesson.blocks.map((block) => (
            <LessonMaterial
              key={block.id}
              block={block}
              courseId={view.enrollment.course.id}
              lessonId={view.lesson.id}
              state={progress.blocks[block.id]}
              sessions={view.enrollment.sessions}
              demo={demo}
              onProgress={onProgress}
            />
          ))}
          <footer className="lesson-footer">
            <div className="lesson-completion" role="status">
              <strong>
                {complete
                  ? 'Урок завершено'
                  : `${Math.round(lessonFraction(view.lesson, progress) * 100)}% уроку опрацьовано`}
              </strong>
              {status}
            </div>
            {view.nextLessonId ? (
              <Link
                className="button"
                href={lessonHref(view.enrollment.course.id, view.nextLessonId, demo)}
              >
                Наступний урок
              </Link>
            ) : (
              <Link className="button" href={demo ? '/demo/account' : '/account'}>
                До моїх курсів
              </Link>
            )}
          </footer>
          {!complete && !view.lesson.blocks.some((b) => b.required && b.kind === 'zoom') && (
            <div className="lesson-manual">
              <button type="button" onClick={confirm}>
                Я опрацював матеріал
              </button>
              <p className="learning-meta">
                Для роботи офлайн або якщо автоматичне збереження не спрацювало
              </p>
            </div>
          )}
        </main>
      </div>
      <dialog
        ref={drawer}
        id="curriculum-drawer"
        className="lesson-drawer"
        aria-label="Зміст курсу"
      >
        <div className="drawer-close">
          <button type="button" aria-label="Закрити зміст" onClick={() => drawer.current?.close()}>
            ×
          </button>
        </div>
        <Link href={demo ? '/demo/account' : '/account'} className="button button-secondary">
          Мої курси
        </Link>
        <CourseCurriculum {...curriculum} onNavigate={() => drawer.current?.close()} />
      </dialog>
      <nav className="lesson-mobile-controls" aria-label="Навігація уроком">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls="curriculum-drawer"
          onClick={() => drawer.current?.showModal()}
        >
          Зміст курсу
        </button>
        {view.nextLessonId ? (
          <Link
            className="button"
            href={lessonHref(view.enrollment.course.id, view.nextLessonId, demo)}
          >
            Наступний урок
          </Link>
        ) : (
          <Link className="button" href={demo ? '/demo/account' : '/account'}>
            Мої курси
          </Link>
        )}
      </nav>
    </div>
  );
}
