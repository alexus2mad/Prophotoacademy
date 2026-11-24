'use client';
import { useWorkshopCheckout } from './hooks';
import type { WorkshopCheckoutActionProps } from './types';

export function WorkshopCheckoutAction({ ticket, editing, preview }: WorkshopCheckoutActionProps) {
  const inert = editing || preview;
  const { sending, error, submit } = useWorkshopCheckout(inert ? undefined : ticket?.href);
  const label = (
    <>
      {sending ? 'Відкриваємо оплату…' : 'Записатися'}
      <span aria-hidden="true">→</span>
    </>
  );
  if (inert)
    return (
      <span className="studio-button" aria-disabled="true" data-site-locked="">
        {label}
      </span>
    );
  if (!ticket?.href) return null;
  return (
    <>
      <button
        type="button"
        className="studio-button"
        data-site-locked=""
        disabled={sending}
        aria-busy={sending}
        onClick={submit}
      >
        {label}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
