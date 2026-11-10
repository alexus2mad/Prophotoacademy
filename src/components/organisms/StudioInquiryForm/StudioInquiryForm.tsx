'use client';

import { Button } from '@/components/atoms/Button/Button';
import { useStudioInquiryForm } from './hooks';
import type { StudioInquiryFormProps } from './types';
import styles from './StudioInquiryForm.module.css';

export function StudioInquiryForm(props: StudioInquiryFormProps) {
  const {
    formId,
    state,
    localCapture,
    review,
    error,
    fieldErrors,
    choices,
    selected,
    setSelected,
    submit,
    reset,
  } = useStudioInquiryForm(props);
  if (state === 'success')
    return (
      <div className={styles.success} role="status">
        <h3>{localCapture ? 'Заявку збережено' : 'Дякуємо за заявку'}</h3>
        <p>
          {localCapture
            ? 'Демонстраційний режим. Заявку збережено локально; команді вона ще не надсилається.'
            : 'Команда ProPhoto зв’яжеться з вами за вказаним контактом.'}
        </p>
        <Button className="studio-button-outline" onClick={reset}>
          Нова заявка
        </Button>
      </div>
    );
  return (
    <form
      className={styles.form}
      data-compact={props.compact || undefined}
      onSubmit={submit}
      aria-busy={state === 'sending'}
    >
      {review && (
        <p className={styles.notice} role="note">
          Форма для огляду. Заявки не надсилаються й дані не зберігаються
        </p>
      )}
      <label className={styles.field} htmlFor={`${formId}-name`}>
        <span>Ім’я</span>
        <input
          id={`${formId}-name`}
          name="name"
          autoComplete="name"
          placeholder="Як до вас звертатися"
          required
          minLength={2}
          maxLength={80}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
        />
      </label>
      {fieldErrors.name && (
        <p className={styles.error} id={`${formId}-name-error`}>
          {fieldErrors.name}
        </p>
      )}
      <label className={styles.field} htmlFor={`${formId}-contact`}>
        <span>Телефон</span>
        <input
          id={`${formId}-contact`}
          name="contact"
          type="tel"
          autoComplete="tel"
          placeholder="+38 0__ ___ __ __"
          required
          maxLength={160}
          aria-invalid={!!fieldErrors.contact}
          aria-describedby={fieldErrors.contact ? `${formId}-contact-error` : undefined}
        />
      </label>
      {fieldErrors.contact && (
        <p className={styles.error} id={`${formId}-contact-error`}>
          {fieldErrors.contact}
        </p>
      )}
      <label className={styles.field} htmlFor={`${formId}-topic`}>
        <span>Що вас цікавить</span>
        <select
          id={`${formId}-topic`}
          name="topic"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          {choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field} htmlFor={`${formId}-message`}>
        <span>Коментар (необов’язково)</span>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={props.compact ? 1 : 2}
          maxLength={1800}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? `${formId}-message-error` : undefined}
        />
      </label>
      {fieldErrors.message && (
        <p className={styles.error} id={`${formId}-message-error`}>
          {fieldErrors.message}
        </p>
      )}
      <label className={styles.honeypot} aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className={styles.consent}>
        <input type="checkbox" name="consent" required aria-invalid={!!fieldErrors.consent} />
        <span>
          Погоджуюся з <a href="/privacy-policy">політикою конфіденційності</a>
        </span>
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Button className="studio-button" type="submit" disabled={state === 'sending' || review}>
        {review ? 'Недоступно в огляді' : state === 'sending' ? 'Надсилаємо…' : 'Надіслати заявку'}
        <span aria-hidden="true">→</span>
      </Button>
    </form>
  );
}
