'use client';
import { useEffect, useRef, useState } from 'react';
import { gradeQuiz } from '@/lib/learning/quiz';
import type { QuizResult } from '@/lib/learning/types';
import type { LessonQuizProps } from './types';

export function useLessonQuiz({
  block,
  state,
  preview,
  onProgress,
  progressError,
}: LessonQuizProps) {
  const saved = state?.revision === block.revision ? state.quiz : undefined;
  const [answers, setAnswers] = useState<Record<string, string>>(saved?.answers || {});
  const [localResult, setLocalResult] = useState<QuizResult>();
  const [reviewing, setReviewing] = useState(!!saved);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const resultHeading = useRef<HTMLDivElement>(null);
  const announceResult = useRef(false);
  const previousAttempt = useRef(saved?.attemptId);
  const result = preview ? localResult : saved;
  useEffect(() => {
    if (progressError) {
      setPending(false);
      setError(progressError);
    }
  }, [progressError]);
  useEffect(() => {
    if (saved && previousAttempt.current !== saved.attemptId) {
      previousAttempt.current = saved.attemptId;
      setPending(false);
      setAnswers(saved.answers);
      setReviewing(true);
    }
  }, [saved]);
  useEffect(() => {
    if (reviewing && announceResult.current) {
      resultHeading.current?.focus({ preventScroll: true });
      resultHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      announceResult.current = false;
    }
  }, [reviewing]);
  function submit() {
    if (!block.quiz || block.quiz.questions.some((q) => !answers[q.id])) {
      setError('Дайте відповідь на кожне запитання');
      return;
    }
    setError('');
    announceResult.current = true;
    if (preview) {
      setLocalResult(gradeQuiz(block.quiz, answers, crypto.randomUUID()));
      setReviewing(true);
    } else {
      setPending(true);
      onProgress({
        kind: 'quiz',
        blockId: block.id,
        revision: block.revision,
        quizAnswers: answers,
      });
    }
  }
  function retry() {
    setAnswers({});
    setReviewing(false);
    setError('');
  }
  return { answers, setAnswers, result, reviewing, pending, error, submit, retry, resultHeading };
}
