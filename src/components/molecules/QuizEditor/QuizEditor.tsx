'use client';
import type { QuizQuestion } from '@/lib/learning/types';
import type { QuizEditorProps } from './types';

export function QuizEditor({ quiz, onChange }: QuizEditorProps) {
  const update = (id: string, change: Partial<QuizQuestion>) =>
    onChange({
      ...quiz,
      questions: quiz.questions.map((q) => (q.id === id ? { ...q, ...change } : q)),
    });
  return (
    <div className="quiz-editor">
      <label>
        Поріг успішної самоперевірки, %
        <input
          type="number"
          min={1}
          max={100}
          value={quiz.passingScore}
          onChange={(e) => onChange({ ...quiz, passingScore: Number(e.target.value) })}
        />
      </label>
      {quiz.questions.map((question, i) => (
        <fieldset key={question.id}>
          <legend>Запитання {i + 1}</legend>
          <label>
            Запитання
            <textarea
              rows={2}
              value={question.prompt}
              maxLength={1000}
              onChange={(e) => update(question.id, { prompt: e.target.value })}
            />
          </label>
          {question.options.map((option, oi) => (
            <label key={option.id}>
              Варіант {oi + 1}
              <input
                value={option.text}
                maxLength={1000}
                onChange={(e) =>
                  update(question.id, {
                    options: question.options.map((o) =>
                      o.id === option.id ? { ...o, text: e.target.value } : o,
                    ),
                  })
                }
              />
            </label>
          ))}
          <label>
            Правильна відповідь
            <select
              value={question.correctOptionId || ''}
              onChange={(e) =>
                update(question.id, { correctOptionId: e.target.value || undefined })
              }
            >
              <option value="">Оберіть відповідь</option>
              {question.options.map((o, oi) => (
                <option key={o.id} value={o.id}>
                  Варіант {oi + 1}: {o.text || 'Без тексту'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Пояснення після перевірки
            <textarea
              rows={3}
              value={question.explanation || ''}
              maxLength={2000}
              onChange={(e) => update(question.id, { explanation: e.target.value })}
            />
          </label>
          <button
            type="button"
            className="editor-icon-control"
            onClick={() =>
              onChange({ ...quiz, questions: quiz.questions.filter((q) => q.id !== question.id) })
            }
          >
            Видалити запитання
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="button button-secondary"
        disabled={quiz.questions.length >= 20}
        onClick={() =>
          onChange({
            ...quiz,
            questions: [
              ...quiz.questions,
              {
                id: crypto.randomUUID(),
                prompt: '',
                options: Array.from({ length: 3 }, () => ({ id: crypto.randomUUID(), text: '' })),
                explanation: '',
              },
            ],
          })
        }
      >
        Додати запитання
      </button>
    </div>
  );
}
