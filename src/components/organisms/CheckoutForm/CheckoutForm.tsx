'use client';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { useCheckoutForm } from './hooks';
import type { CheckoutFormProps } from './types';

export function CheckoutForm({ offeringId, packageId, mock }: CheckoutFormProps) {
  const { state, error, fieldErrors, submit } = useCheckoutForm({ offeringId, packageId, mock });
  return (
    <form className="form-stack" onSubmit={submit}>
      <FormField
        id="checkout-name"
        label="Ваше ім’я"
        name="name"
        autoComplete="name"
        required
        minLength={2}
        maxLength={80}
        error={fieldErrors.name}
      />
      <FormField
        id="checkout-email"
        label="Email для доступу до навчання"
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={160}
        error={fieldErrors.email}
      />
      <FormField
        id="checkout-phone"
        label="Телефон"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        pattern="\+?[0-9\s\(\)\-]{9,24}"
        placeholder="+380"
        error={fieldErrors.phone}
      />
      <label className="checkbox-label">
        <input
          name="consent"
          type="checkbox"
          required
          aria-invalid={fieldErrors.consent ? true : undefined}
          aria-describedby={fieldErrors.consent ? 'checkout-consent-error' : undefined}
        />
        <span>
          Погоджуюся з{' '}
          <a href="/terms-of-service" target="_blank">
            публічною офертою
          </a>{' '}
          та{' '}
          <a href="/privacy-policy" target="_blank">
            політикою конфіденційності
          </a>
          .
        </span>
      </label>
      {fieldErrors.consent && (
        <p id="checkout-consent-error" className="form-error">
          {fieldErrors.consent}
        </p>
      )}
      {error && !Object.keys(fieldErrors).length && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="button button-wide" disabled={state === 'sending'}>
        {state === 'sending'
          ? 'Готуємо замовлення…'
          : mock
            ? 'Перевірити оформлення'
            : 'Перейти до оплати'}
      </Button>
      {mock && (
        <p className="mock-notice">
          Демонстраційний режим. Гроші не списуються. Дані зберігаються лише локально для перевірки
          оформлення.
        </p>
      )}
    </form>
  );
}
