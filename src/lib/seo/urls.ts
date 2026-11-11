const localSite = 'http://127.0.0.1:3000';

export function cleanPathname(value: string) {
  const pathname = value.split(/[?#]/, 1)[0];
  if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\')) return '/';
  if (/(?:^|\/)(?:\.|%2e){1,2}(?:\/|$)/i.test(pathname)) return '/';
  return pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

function publicUrl(pathname: string, base: string) {
  const url = new URL(base);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    throw new Error('Public URLs require an HTTP(S) site URL without credentials');
  const prefix = url.pathname.replace(/\/+$/, '');
  const path = cleanPathname(pathname);
  url.pathname =
    prefix && (path === prefix || path.startsWith(prefix + '/')) ? path : prefix + path;
  url.search = '';
  url.hash = '';
  return url.href;
}

/** Asset URLs stay on the current build's origin, including review export prefixes. */
export function siteUrl(pathname: string) {
  return publicUrl(pathname, process.env.NEXT_PUBLIC_SITE_URL || localSite);
}

export function academyCanonical(pathname: string) {
  return publicUrl(
    pathname,
    process.env.NEXT_PUBLIC_ACADEMY_URL || process.env.NEXT_PUBLIC_SITE_URL || localSite,
  );
}
