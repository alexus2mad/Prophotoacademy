'use client';
import { getAcquisition } from '@/lib/attribution';
import { createCheckoutIdentity } from '@/lib/commerce/checkout-identity';
import { useEffect, useRef, useState } from 'react';
import type {
  CheckoutFormProps,
  CheckoutIdentity,
  CheckoutResult,
  CheckoutState,
  CheckoutWidget,
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

function checkoutStillOpen(form: HTMLFormElement) {
  const dialog = form.closest('dialog');
  return form.isConnected && (!dialog || dialog.open);
}

function closeWidget(widget: CheckoutWidget) {
  try {
    widget.instance.closeit();
  } catch {
    // WayForPay can remove its iframe before the close or navigation callback runs.
  }
}

function restoreCheckout(widget: CheckoutWidget) {
  const dialog = widget.dialog;
  if (dialog?.isConnected && !dialog.open) dialog.showModal();
}

export function useCheckoutForm({ offeringId, packageId }: CheckoutFormProps) {
  const [state, setState] = useState<CheckoutState>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [promo, setPromo] = useState<PromoState>({ value: '', checking: false });
  const identity = useRef<CheckoutIdentity | null>(null);
  const payment = useRef<CheckoutWidget | null>(null);

  // Closing the widget without paying returns the form; the next attempt is a new order,
  // because WayForPay does not accept a second payment for an order reference.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data !== 'WfpWidgetEventClose' || !payment.current) return;
      const widget = payment.current;
      payment.current = null;
      restoreCheckout(widget);
      identity.current = null;
      setState('idle');
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (payment.current) closeWidget(payment.current);
      payment.current = null;
    };
  }, []);

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

  async function pay(result: CheckoutResult, token: string, form: HTMLFormElement) {
    const fields = result.fields!;
    const thanks = String(fields.returnUrl);
    let Widget;
    try {
      Widget = await loadWidget();
    } catch {
      if (checkoutStillOpen(form)) submitHostedForm(result.action!, fields);
      return;
    }
    if (!checkoutStillOpen(form)) return;
    const widget: CheckoutWidget = { instance: new Widget(), dialog: form.closest('dialog') };
    payment.current = widget;
    // The provider appends its widget outside the checkout dialog and needs the top layer.
    widget.dialog?.close();
    setState('paying');
    try {
      widget.instance.run(
        { ...fields, straightWidget: true },
        () => {
          reportWidgetEvent(token, 'approved');
          window.location.assign(thanks);
        },
        () => {
          if (payment.current !== widget) return;
          payment.current = null;
          closeWidget(widget);
          restoreCheckout(widget);
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
    } catch (error) {
      payment.current = null;
      closeWidget(widget);
      restoreCheckout(widget);
      throw error;
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setError('');
    setFieldErrors({});
    const formElement = event.currentTarget;
    identity.current ??= createCheckoutIdentity();
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
      if (!checkoutStillOpen(formElement)) return;
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
      await pay(result, identity.current.token, formElement);
    } catch (error) {
      setState('error');
      setError(error instanceof Error ? error.message : 'Спробуйте ще раз.');
    }
  }
  return { state, error, fieldErrors, promo, changePromo, applyPromo, submit };
}
