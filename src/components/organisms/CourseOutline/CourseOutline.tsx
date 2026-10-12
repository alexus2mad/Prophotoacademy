'use client';
import { lessonLabel } from '@/lib/learning/numbering';
import { materialLabel, materialNames } from '@/lib/learning/editor';
import type { CourseOutlineProps } from './types';

export function CourseOutline(p: CourseOutlineProps) {
  return (
    <aside className="authoring-outline" aria-label="Структура курсу">
      <h2>Програма курсу</h2>
      {p.draft.modules.map((module, mi) => (
        <details
          key={module.id}
          className="authoring-module"
          open={module.lessons.some((l) => l.id === p.activeId)}
        >
          <summary>
            {module.title || 'Новий модуль'}
            <span>{module.lessons.length}</span>
          </summary>
          <ol className="authoring-lessons">
            {module.lessons.map((lesson, index) => (
              <li
                key={lesson.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', lesson.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const from = module.lessons.findIndex(
                    (l) => l.id === event.dataTransfer.getData('text/plain'),
                  );
                  if (from >= 0) p.onMoveLesson(module.id, module.lessons[from].id, index - from);
                }}
              >
                <button
                  type="button"
                  className="authoring-lesson"
                  aria-current={p.activeId === lesson.id ? 'true' : undefined}
                  onClick={() => p.onLesson(lesson.id)}
                >
                  {lessonLabel(p.draft, lesson)}
                </button>
                {p.activeId === lesson.id && (
                  <>
                    <ol className="authoring-materials" aria-label="Матеріали уроку">
                      {lesson.blocks.map((block) => (
                        <li key={block.id}>
                          <button
                            type="button"
                            aria-current={p.activeBlockId === block.id ? 'true' : undefined}
                            onClick={() => p.onBlock(block.id)}
                          >
                            <span>{materialNames[block.kind]}</span>
                            {materialLabel(block)}
                          </button>
                        </li>
                      ))}
                    </ol>
                    <details className="authoring-outline-options">
                      <summary>Порядок уроку</summary>
                      <div>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => p.onMoveLesson(module.id, lesson.id, -1)}
                        >
                          Вище
                        </button>
                        <button
                          type="button"
                          disabled={index === module.lessons.length - 1}
                          onClick={() => p.onMoveLesson(module.id, lesson.id, 1)}
                        >
                          Нижче
                        </button>
                      </div>
                    </details>
                  </>
                )}
              </li>
            ))}
          </ol>
          <button type="button" className="authoring-add" onClick={() => p.onAddLesson(module.id)}>
            + Додати урок
          </button>
          <details className="authoring-outline-options">
            <summary>Параметри модуля</summary>
            <label>
              Назва модуля
              <input
                value={module.title}
                onChange={(e) => p.onModuleTitle(module.id, e.target.value)}
              />
            </label>
            <div>
              <button
                type="button"
                disabled={mi === 0}
                onClick={() => p.onMoveModule(module.id, -1)}
              >
                Вище
              </button>
              <button
                type="button"
                disabled={mi === p.draft.modules.length - 1}
                onClick={() => p.onMoveModule(module.id, 1)}
              >
                Нижче
              </button>
            </div>
          </details>
        </details>
      ))}
      <button type="button" className="button button-secondary" onClick={p.onAddModule}>
        Додати модуль
      </button>
    </aside>
  );
}
