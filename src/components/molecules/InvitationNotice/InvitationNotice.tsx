'use client';
import { Button } from '@/components/atoms/Button/Button';
import { useInvitationNotice } from './hooks';
import type { InvitationStatus } from '@/lib/notifications/types';
import type { InvitationNoticeProps } from './types';

const statusText: Record<InvitationStatus['state'], string> = {
  none: 'Запрошення ще не надсилали',
  pending: 'Запрошення в черзі на відправлення',
  sent: 'Запрошення передано поштовому сервісу',
  retrying: 'Лист поки не надіслано — повторюємо спробу',
  local: 'Email-відправлення в цьому середовищі вимкнено',
  canceled: 'Попереднє запрошення скасовано',
};

export function InvitationNotice(props: InvitationNoticeProps) {
  const h = useInvitationNotice(props);
  const state = props.invitation?.state || 'none';
  const queued = state === 'pending' || state === 'retrying';
  const label = queued
    ? 'Оновити стан'
    : state === 'none' || state === 'canceled'
      ? 'Надіслати запрошення'
      : 'Надіслати повторно';
  return (
    <div className="invitation-notice" role="group" aria-label={`Запрошення для ${props.email}`}>
      <div className="invitation-notice-summary">
        <p role="status">{statusText[state]}</p>
        <Button
          className="button button-secondary"
          aria-label={`${label} для ${props.email}`}
          disabled={h.busy}
          onClick={queued ? h.refresh : h.send}
        >
          {h.busy ? 'Додаємо в чергу…' : label}
        </Button>
      </div>
      {h.error && (
        <p className="learning-error" role="alert">
          {h.error}
        </p>
      )}
      {h.message && (props.demo || state === 'none') && <p role="status">{h.message}</p>}
    </div>
  );
}
