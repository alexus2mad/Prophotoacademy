const academyOrigin = 'https://prophotoacademy.com.ua';
const indexHosts = new Set([
  'prophotoacademy.com.ua',
  'www.prophotoacademy.com.ua',
  'staging.prophotoacademy.com.ua',
]);

/** Imported testimonials commonly cite the Academy's index rather than their original. */
export function originalReviewSource(source?: string): string | undefined {
  const value = source?.trim();
  if (!value || !/^(https?:\/\/|\/(?!\/))/i.test(value) || value.includes('\\')) return;
  try {
    const url = new URL(value, academyOrigin);
    if (url.username || url.password) return;
    if (indexHosts.has(url.hostname) && /^\/reviews\/?$/i.test(url.pathname)) return;
    return value;
  } catch {
    return undefined;
  }
}
