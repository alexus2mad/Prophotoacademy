'use client';
import { Button } from '@/components/atoms/Button/Button';
import { usePreviewBanner } from './hooks';

export function PreviewBanner() {
  const { busy, error, exit } = usePreviewBanner();
  return (
    <div className="preview-banner">
      <span>
        {error ? 'Не вдалося закрити попередній перегляд' : 'Попередній перегляд чернеток'}
      </span>
      <Button onClick={exit} disabled={busy}>
        {busy ? 'Закриваємо…' : 'Повернутися до опублікованого сайту'}
      </Button>
    </div>
  );
}
