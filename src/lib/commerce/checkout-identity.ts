/** The bearer receipt token and idempotency key belong to one checkout attempt. */
export function createCheckoutIdentity() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return {
    token: Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''),
    key: crypto.randomUUID(),
  };
}
