'use client';
import { StatusFrame } from '@/components/templates/StatusFrame/StatusFrame';
import type { ErrorBoundaryProps } from '@/app/types';

export default function ErrorPage({ reset }: ErrorBoundaryProps) {
  return (
    <StatusFrame>
      <h1>Не вдалося завантажити сторінку</h1>
      <p>Спробуйте ще раз або зв’яжіться з академією.</p>
      <button type="button" className="button" onClick={reset}>
        Спробувати ще раз
      </button>
      <a href="mailto:academyprophoto@gmail.com" className="text-link">
        Написати академії
      </a>
    </StatusFrame>
  );
}
