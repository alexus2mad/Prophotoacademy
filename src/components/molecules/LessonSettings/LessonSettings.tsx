import type { LessonSettingsProps } from './types';

export function LessonSettings({ lesson, number, onChange }: LessonSettingsProps) {
  return (
    <details className="authoring-settings">
      <summary>Назва й параметри уроку</summary>
      <div className="authoring-settings-fields">
        <div className="authoring-title-fields">
          <label>
            Номер лекції
            <input
              type="number"
              min={1}
              max={20000}
              value={lesson.number || ''}
              placeholder={String(number || 1)}
              onChange={(e) =>
                onChange({ number: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </label>
          <label>
            Назва уроку
            <input value={lesson.title} onChange={(e) => onChange({ title: e.target.value })} />
          </label>
        </div>
        <label>
          Короткий опис
          <textarea
            value={lesson.summary}
            rows={3}
            onChange={(e) => onChange({ summary: e.target.value })}
          />
        </label>
        <div className="admin-form-row">
          <label>
            Відкрити з · UTC
            <input
              type="datetime-local"
              value={lesson.releaseAt?.slice(0, 16) || ''}
              onChange={(e) =>
                onChange({
                  releaseAt: e.target.value
                    ? new Date(e.target.value + 'Z').toISOString()
                    : undefined,
                })
              }
            />
            <span className="admin-muted">Залиште порожнім для доступу одразу</span>
          </label>
          <label className="inline-check">
            <input
              type="checkbox"
              checked={!!lesson.introductory}
              onChange={(e) => onChange({ introductory: e.target.checked })}
            />
            Вступний урок доступний до початку набору
          </label>
        </div>
      </div>
    </details>
  );
}
