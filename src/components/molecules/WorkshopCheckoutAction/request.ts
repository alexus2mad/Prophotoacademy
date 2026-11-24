import { getAcquisition } from '@/lib/attribution';
import { createCheckoutIdentity } from '@/lib/commerce/checkout-identity';

const attempts = new Map<string, ReturnType<typeof createCheckoutIdentity>>();
const requests = new Map<string, Promise<string>>();
const failure = 'Не вдалося відкрити оплату. Спробуйте ще раз.';

function identityFor(href: string) {
  const previous = attempts.get(href);
  if (previous) return previous;
  const identity = createCheckoutIdentity();
  attempts.set(href, identity);
  return identity;
}

export function paymentDestination(value: unknown, origin: string, token: string) {
  if (typeof value !== 'string') throw new Error(failure);
  const next = new URL(value, origin);
  if (
    !next.username &&
    !next.password &&
    (next.origin === 'https://secure.wayforpay.com' ||
      (next.origin === origin &&
        next.pathname === '/thanks' &&
        next.searchParams.get('token') === token))
  )
    return next.href;
  throw new Error(failure);
}

async function requestTicket(href: string) {
  const origin = window.location.origin;
  const endpoint = new URL(href, origin);
  if (endpoint.origin !== origin || endpoint.pathname !== '/api/checkout/workshop')
    throw new Error(failure);
  const identity = identityFor(href);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: identity.token,
      idempotencyKey: identity.key,
      acquisition: getAcquisition('academy'),
    }),
  }).catch(() => {
    throw new Error('Не вдалося з’єднатися. Перевірте інтернет і спробуйте ще раз.');
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : failure);
  return paymentDestination(result.url, origin, identity.token);
}

// The cover, offer and sticky action address the same checkout. Coalesce their
// requests so rapid presses and network retries retain the same order identity.
export function startWorkshopCheckout(href: string) {
  const pending = requests.get(href);
  if (pending) return pending;
  const next = requestTicket(href).finally(() => requests.delete(href));
  requests.set(href, next);
  return next;
}
