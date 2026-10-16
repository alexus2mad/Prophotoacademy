import { Button } from '@/components/atoms/Button/Button';
import { FieldError } from '@/components/atoms/FieldError/FieldError';
import { Input } from '@/components/atoms/Input/Input';
import { money } from '@/lib/format';
import type { PromoCodeFieldProps } from './types';

export function PromoCodeField({
  value,
  quote,
  error,
  checking,
  onChange,
  onApply,
}: PromoCodeFieldProps) {
  return (
    <div className="form-field promo-field">
      <label htmlFor="checkout-promo">Промокод</label>
      <div className="promo-field-row">
        <Input
          id="checkout-promo"
          name="promoCode"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            onApply();
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={32}
          error={error}
        />
        <Button
          className="button button-secondary"
          onClick={onApply}
          disabled={checking || !value.trim()}
        >
          {checking ? 'Перевіряємо…' : 'Застосувати'}
        </Button>
      </div>
      <FieldError id="checkout-promo" message={error} />
      {quote && !error && (
        <p className="promo-field-result" role="status">
          Знижка {quote.percent}% · до оплати {money(quote.amount)}
        </p>
      )}
    </div>
  );
}
