'use client';
import { getAcquisition } from '@/lib/attribution';
import { useRef, useState } from 'react';
import type { CheckoutFormProps, CheckoutIdentity, CheckoutState } from './types';

export function useCheckoutForm({ offeringId, packageId }: CheckoutFormProps) {
  const [state, setState] = useState<CheckoutState>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const identity = useRef<CheckoutIdentity | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setError('');
    setFieldErrors({});
    const formElement = event.currentTarget;
    if (!identity.current) {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      identity.current = {
        token: Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(''),
        key: crypto.randomUUID(),
      };
    }
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acquisition: getAcquisition('academy'),
          offeringId,
          packageId,
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          consent: data.get('consent') === 'on',
          token: identity.current.token,
          idempotencyKey: identity.current.key,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const fields = result.fieldErrors || {};
        setFieldErrors(fields);
        const name = Object.keys(fields)[0];
        if (name) (formElement.elements.namedItem(name) as HTMLElement | null)?.focus();
        throw new Error(result.error || 'Не вдалося оформити замовлення.');
      }
      if (result.mode === 'mock') {
        window.location.assign(result.url);
        return;
      }
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = result.action;
      Object.entries(result.fields).forEach(([name, value]) => {
        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = Array.isArray(value) ? `${name}[]` : name;
          input.value = String(v);
          form.appendChild(input);
        });
      });
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setState('error');
      setError(error instanceof Error ? error.message : 'Спробуйте ще раз.');
    }
  }
  return { state, error, fieldErrors, submit };
}
