export function cashboxUrl() {
  const value =
    process.env.NEXT_PUBLIC_CASHBOX_URL ||
    'https://booking.plainstack.net/admin.html?view=cashbox&channel=wayforpay';
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch {}
  return 'https://booking.plainstack.net/admin.html?view=cashbox&channel=wayforpay';
}
