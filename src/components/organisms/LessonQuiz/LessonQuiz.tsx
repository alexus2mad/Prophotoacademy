'use client';
import { Check, X } from 'lucide-react';
import { useLessonQuiz } from './hooks';
import type { LessonQuizProps } from './types';

export function LessonQuiz(props: LessonQuizProps) {
  const { block } = props;
  const h = useLessonQuiz(props);
  if (!block.quiz?.questions.length) return null;
  const questions = block.quiz.questions;
  return (
    <section className="lesson-block lesson-quiz" aria-labelledby={'quiz-title-' + block.id}>
      <header className="quiz-heading">
        <p className="learning-meta">Підсумковий тест · {questions.length} запитань</p>
        <h2 id={'quiz-title-' + block.id}>{block.title || 'Перевірте себе'}</h2>
        <p>
          Для завершення уроку потрібно від {block.quiz.passingScore}% правильних відповідей. Одна
          відповідь на запитання, кількість спроб необмежена
        </p>
      </header>
      {h.reviewing && h.result && (
        <div
          ref={h.resultHeading}
          tabIndex={-1}
          className={'quiz-result ' + (h.result.passed ? 'is-passed' : 'is-failed')}
          role="status"
        >
          <strong>
            {h.result.correct} із {h.result.total} правильних відповідей
          </strong>
          <p>
            {h.result.passed
              ? 'Добре опрацьовано — перенесіть ці рішення у власну зйомку'
              : 'Зверніть увагу на пояснення нижче та поверніться до прикладів уроку'}
          </p>
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          h.submit();
        }}
      >
        {questions.map((question, index) => {
          const feedback = h.reviewing
            ? h.result?.feedback.find((f) => f.questionId === question.id)
            : undefined;
          return (
            <fieldset
              key={question.id}
              className="quiz-question"
              disabled={h.pending || h.reviewing}
            >
              <legend>
                <span className="quiz-question-number">{index + 1}</span>
                {question.prompt}
              </legend>
              <div className="quiz-options">
                {question.options.map((option) => {
                  const selected = h.answers[question.id] === option.id;
                  const correct =
                    !!feedback &&
                    (feedback.correctOptionId === option.id || (feedback.correct && selected));
                  const incorrect = !!feedback && selected && !feedback.correct;
                  return (
                    <label
                      key={option.id}
                      className={
                        'quiz-option' +
                        (selected ? ' is-selected' : '') +
                        (correct ? ' is-correct' : incorrect ? ' is-incorrect' : '')
                      }
                    >
                      <input
                        type="radio"
                        name={block.id + '-' + question.id}
                        value={option.id}
                        required
                        checked={h.answers[question.id] === option.id}
                        onChange={() => h.setAnswers({ ...h.answers, [question.id]: option.id })}
                      />
                      <span className="quiz-option-content">
                        <span>{option.text}</span>
                        {(correct || incorrect) && (
                          <span className="quiz-option-verdict">
                            {correct ? (
                              <Check size={17} aria-hidden="true" />
                            ) : (
                              <X size={17} aria-hidden="true" />
                            )}
                            {correct
                              ? selected
                                ? 'Ваша відповідь — правильно'
                                : 'Правильна відповідь'
                              : 'Ваша відповідь — неправильно'}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
              {feedback && (
                <div
                  className={'quiz-feedback ' + (feedback.correct ? 'is-correct' : 'is-incorrect')}
                >
                  <strong>{feedback.correct ? 'Правильно' : 'Неправильно'}</strong>
                  <p>{feedback.explanation}</p>
                </div>
              )}
            </fieldset>
          );
        })}
        {h.error && (
          <p role="alert" className="learning-error">
            {h.error}
          </p>
        )}
        <div className="quiz-actions">
          {h.reviewing ? (
            <button type="button" className="button button-secondary" onClick={h.retry}>
              Спробувати ще раз
            </button>
          ) : (
            <button className="button" type="submit" disabled={h.pending}>
              {h.pending ? 'Зберігаємо відповіді…' : 'Перевірити відповіді'}
            </button>
          )}
          {!h.reviewing && (
            <p className="learning-meta" role="status">
              {h.pending
                ? 'Якщо зв’язок перервався, відповіді надішлються повторно'
                : `Відповідей: ${Object.keys(h.answers).length} із ${questions.length}`}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
