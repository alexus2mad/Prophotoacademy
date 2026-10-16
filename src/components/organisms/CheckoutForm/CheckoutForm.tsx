'use client';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { PromoCodeField } from '@/components/molecules/PromoCodeField/PromoCodeField';
import { useCheckoutForm } from './hooks';
import type { CheckoutFormProps } from './types';

export function CheckoutForm(props: CheckoutFormProps) {
  const { mode, kind, email, name } = props;
  const { state, error, fieldErrors, promo, changePromo, applyPromo, submit } =
    useCheckoutForm(props);
  const product = kind === 'product';
  return (
    <form className="form-stack" onSubmit={submit}>
      <FormField
        id="checkout-name"
        label="Ваше ім’я"
        name="name"
        defaultValue={name}
        autoComplete="name"
        required
        minLength={2}
        maxLength={80}
        error={fieldErrors.name}
      />
      <FormField
        id="checkout-email"
        label={product ? 'Email для підтвердження' : 'Email для доступу до навчання'}
        name="email"
        defaultValue={email}
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
      <div className="form-row">
        <FormField
          id="checkout-telegram"
          label="Нік у Telegram (необов’язково)"
          name="telegram"
          autoComplete="off"
          spellCheck={false}
          maxLength={65}
          pattern="@?[A-Za-z0-9_.]{1,64}"
          placeholder="@nickname"
          error={fieldErrors.telegram}
        />
        <FormField
          id="checkout-instagram"
          label="Нік в Instagram (необов’язково)"
          name="instagram"
          autoComplete="off"
          spellCheck={false}
          maxLength={65}
          pattern="@?[A-Za-z0-9_.]{1,64}"
          placeholder="@nickname"
          error={fieldErrors.instagram}
        />
      </div>
      {mode === 'wayforpay' && (
        <PromoCodeField
          value={promo.value}
          quote={promo.quote}
          error={promo.error}
          checking={promo.checking}
          onChange={changePromo}
          onApply={applyPromo}
        />
      )}
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
      <Button
        type="submit"
        className="button button-wide"
        disabled={state === 'sending' || state === 'paying'}
      >
        {state === 'sending'
          ? 'Готуємо замовлення…'
          : state === 'paying'
            ? 'Відкрито вікно оплати…'
            : mode === 'disabled'
              ? 'Отримати доступ без оплати'
              : mode === 'mock'
                ? 'Перевірити оформлення'
                : 'Перейти до оплати'}
      </Button>
      {mode === 'mock' && (
        <p className="mock-notice">Демонстрація оформлення. Оплати й доступу до навчання немає.</p>
      )}
    </form>
  );
}
