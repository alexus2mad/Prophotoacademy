'use client';
import { getAcquisition } from '@/lib/attribution';
import { useEffect, useRef, useState } from 'react';
import type {
  CheckoutFormProps,
  CheckoutIdentity,
  CheckoutResult,
  CheckoutState,
  PaymentFields,
  PromoState,
  WayforpayWindow,
  WidgetEvent,
} from './types';

const widgetScript = 'https://secure.wayforpay.com/server/pay-widget.js';

// WayForPay's on-page widget, as on the original site. Loaded only when a buyer pays.
function loadWidget() {
  const browser = window as WayforpayWindow;
  if (browser.Wayforpay) return Promise.resolve(browser.Wayforpay);
  return new Promise<NonNullable<WayforpayWindow['Wayforpay']>>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => reject(new Error('Widget timeout')), 10_000);
    script.src = widgetScript;
    script.async = true;
    script.onload = () => {
      clearTimeout(timer);
      if (browser.Wayforpay) resolve(browser.Wayforpay);
      else reject(new Error('Widget unavailable'));
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Widget unavailable'));
    };
    document.head.appendChild(script);
  });
}

// Fallback when the widget cannot load: WayForPay's hosted payment page.
function submitHostedForm(action: string, fields: PaymentFields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  Object.entries(fields).forEach(([name, value]) => {
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
}

function reportWidgetEvent(token: string, event: WidgetEvent) {
  void fetch('/api/checkout/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, event }),
    keepalive: true,
  }).catch(() => undefined);
}

export function useCheckoutForm({ offeringId, packageId }: CheckoutFormProps) {
  const [state, setState] = useState<CheckoutState>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [promo, setPromo] = useState<PromoState>({ value: '', checking: false });
  const identity = useRef<CheckoutIdentity | null>(null);

  // Closing the widget without paying returns the form; the next attempt is a new order,
  // because WayForPay does not accept a second payment for an order reference.
  useEffect(() => {
    if (state !== 'paying') return;
    const onMessage = (event: MessageEvent) => {
      if (event.data !== 'WfpWidgetEventClose') return;
      identity.current = null;
      setState('idle');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [state]);

  function changePromo(value: string) {
    setPromo({ value, checking: false });
  }

  async function applyPromo() {
    const code = promo.value.trim();
    if (!code) return;
    setPromo({ value: promo.value, checking: true });
    try {
      const response = await fetch('/api/checkout/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offeringId, packageId, promoCode: code }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.fieldErrors?.promoCode || result.error || 'Промокод недійсний');
      setPromo({ value: promo.value, quote: result, checking: false });
    } catch (error) {
      setPromo({
        value: promo.value,
        checking: false,
        error: error instanceof Error ? error.message : 'Промокод недійсний',
      });
    }
  }

  async function pay(result: CheckoutResult, token: string) {
    const fields = result.fields!;
    const thanks = String(fields.returnUrl);
    let Widget;
    try {
      Widget = await loadWidget();
    } catch {
      submitHostedForm(result.action!, fields);
      return;
    }
    setState('paying');
    new Widget().run(
      { ...fields, straightWidget: true },
      () => {
        reportWidgetEvent(token, 'approved');
        window.location.assign(thanks);
      },
      () => {
        reportWidgetEvent(token, 'declined');
        identity.current = null;
        setState('error');
        setError('Оплату відхилено. Перевірте дані картки або спробуйте іншу.');
      },
      () => {
        reportWidgetEvent(token, 'pending');
        window.location.assign(thanks);
      },
    );
  }

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
    const data = new FormData(formElement);
    const optional = (name: string) => String(data.get(name) || '').trim() || undefined;
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
          telegram: optional('telegram'),
          instagram: optional('instagram'),
          promoCode: promo.value.trim() || undefined,
          consent: data.get('consent') === 'on',
          token: identity.current.token,
          idempotencyKey: identity.current.key,
        }),
      });
      const result: CheckoutResult = await response.json();
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) identity.current = null;
        const fields = result.fieldErrors || {};
        if (fields.promoCode)
          setPromo((p) => ({ ...p, quote: undefined, error: fields.promoCode }));
        setFieldErrors(fields);
        const name = Object.keys(fields)[0];
        if (name) (formElement.elements.namedItem(name) as HTMLElement | null)?.focus();
        throw new Error(result.error || 'Не вдалося оформити замовлення.');
      }
      if (result.mode === 'mock' || result.mode === 'disabled') {
        window.location.assign(result.url!);
        return;
      }
      await pay(result, identity.current.token);
    } catch (error) {
      setState('error');
      setError(error instanceof Error ? error.message : 'Спробуйте ще раз.');
    }
  }
  return { state, error, fieldErrors, promo, changePromo, applyPromo, submit };
}
