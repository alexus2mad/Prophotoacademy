'use client';
import { useWorkshopCheckout } from './hooks';
import type { WorkshopCheckoutActionProps } from './types';

export function WorkshopCheckoutAction({
  ticket,
  option,
  editing,
  preview,
  children,
  className = 'studio-button',
  label: name,
}: WorkshopCheckoutActionProps) {
  const inert = editing || preview;
  const href = option ? option.href : ticket?.href;
  const { sending, error, submit } = useWorkshopCheckout(inert ? undefined : href);
  const label = children ?? (
    <>
      {sending ? 'Відкриваємо оплату…' : 'Записатися'}
      <span aria-hidden="true">→</span>
    </>
  );
  if (inert)
    return (
      <span className={className} aria-disabled="true" aria-label={name} data-site-locked="">
        {label}
      </span>
    );
  if (!href)
    // A ticket off sale keeps showing its price card, without a purchase action.
    return children ? (
      <span className={className} aria-label={name} data-site-locked="">
        {children}
      </span>
    ) : null;
  return (
    <>
      <button
        type="button"
        className={className}
        data-site-locked=""
        aria-label={name}
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
