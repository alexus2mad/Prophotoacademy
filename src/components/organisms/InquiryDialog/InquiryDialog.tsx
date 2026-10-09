'use client';
import { Button } from '@/components/atoms/Button/Button';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { FormField } from '@/components/molecules/FormField/FormField';
import { siteHref } from '@/lib/ecosystem';
import { Check } from 'lucide-react';
import { useInquiryDialog } from './hooks';
import type { InquiryDialogProps } from './types';

export function InquiryDialog({
  site = 'academy',
  privacyUrl = '/privacy-policy',
}: InquiryDialogProps) {
  const { review, dialog, context, state, error, localCapture, fieldErrors, submit } =
    useInquiryDialog({ site, privacyUrl });
  return (
    <Dialog
      dialogRef={dialog}
      className="inquiry-dialog"
      aria-labelledby="inquiry-title"
      closeLabel="Закрити"
      closeOnBackdrop
      closeIconSize={22}
    >
      {state === 'success' ? (
        <div className="success-state" role="status">
          <Check size={32} />
          <h2 id="inquiry-title">{localCapture ? 'Заявку збережено' : 'Заявку отримано'}</h2>
          <p>
            {localCapture
              ? 'Демонстраційний режим. Заявку збережено локально; команді ProPhoto вона ще не надсилається.'
              : 'Команда ProPhoto зв’яжеться з вами за вказаним контактом.'}
          </p>
          <Button className="button" onClick={() => dialog.current?.close()}>
            Готово
          </Button>
        </div>
      ) : (
        <>
          <h2 id="inquiry-title">{context.title || 'Знайдемо вашу програму'}</h2>
          {review && (
            <p className="mock-notice" role="note">
              Форма показана для огляду. Заявки не надсилаються й дані не зберігаються.
            </p>
          )}
          <p className="muted">
            {context.practiceSessionId
              ? 'Залиште контакт. Повідомимо про формат, дату й вартість, коли підтвердимо деталі практики.'
              : 'Залиште контакт. Допоможемо з форматом, пакетом і найближчим набором.'}
          </p>
          {context.practiceSessionId && (
            <p className="practice-online-alternative">
              Навчаєтеся поза Києвом?{' '}
              <a href={siteHref('academy', 'courses?format=online')}>Переглянути онлайн-навчання</a>
            </p>
          )}
          <form onSubmit={submit} className="form-stack">
            <FormField
              id="inquiry-name"
              label="Ваше ім’я"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              error={fieldErrors.name}
            />
            <FormField
              id="inquiry-contact"
              label="Телефон або email"
              name="contact"
              autoComplete="email"
              required
              maxLength={160}
              placeholder="+380 або ваш email"
              error={fieldErrors.contact}
            />
            <label htmlFor="inquiry-message">
              {context.practiceSessionId
                ? 'Який контент хочете створити?'
                : 'Що хочете навчитися знімати?'}{' '}
              <span className="muted">Необов’язково</span>
              <textarea
                id="inquiry-message"
                name="message"
                rows={3}
                maxLength={2000}
                aria-invalid={fieldErrors.message ? true : undefined}
                aria-describedby={fieldErrors.message ? 'inquiry-message-error' : undefined}
              />
            </label>
            {fieldErrors.message && (
              <p id="inquiry-message-error" className="form-error">
                {fieldErrors.message}
              </p>
            )}
            <label className="honeypot" aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="consent"
                required
                aria-invalid={fieldErrors.consent ? true : undefined}
                aria-describedby={fieldErrors.consent ? 'inquiry-consent-error' : undefined}
              />{' '}
              <span>
                Погоджуюся з <a href={privacyUrl}>політикою конфіденційності</a>.
              </span>
            </label>
            <label className="checkbox-label">
              <input name="marketingUpdates" type="checkbox" />
              <span>Хочу отримувати анонси навчання та практики ProPhoto</span>
            </label>
            {fieldErrors.consent && (
              <p id="inquiry-consent-error" className="form-error">
                {fieldErrors.consent}
              </p>
            )}
            {error && !Object.keys(fieldErrors).length && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="button" disabled={state === 'sending' || review}>
              {review
                ? 'Недоступно в огляді'
                : state === 'sending'
                  ? 'Надсилаємо…'
                  : 'Надіслати заявку'}
            </Button>
          </form>
        </>
      )}
    </Dialog>
  );
}
