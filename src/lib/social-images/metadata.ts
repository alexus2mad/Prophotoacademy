import type { Metadata } from 'next';
import { cleanPathname, siteUrl } from '@/lib/seo/urls';
import images from './images.json';
import type { SocialImageEntry, SocialMetadataOptions } from './types';

const catalog: Record<string, SocialImageEntry> = images;
const privateFamilies = ['/account', '/admin', '/learn', '/login', '/checkout', '/thanks'];

function privateFamily(pathname: string) {
  const matches = (prefix: string) => pathname === prefix || pathname.startsWith(prefix + '/');
  if (matches('/studio') || matches('/operations') || matches('/demo/admin')) return '/admin';
  if (matches('/demo/learn')) return '/learn';
  if (matches('/demo')) return '/account';
  return privateFamilies.find(matches);
}

/** Preserve the Pages repository prefix exactly once and never retain query credentials. */
export const socialUrl = siteUrl;

function canonicalUrl(pathname: string, fallback: string) {
  if (/^https?:\/\//.test(pathname)) {
    const url = new URL(pathname);
    if (url.username || url.password) return socialUrl(fallback);
    url.search = '';
    url.hash = '';
    return url.href;
  }
  return socialUrl(pathname);
}

export function socialMetadata(
  key: string,
  options: SocialMetadataOptions = {},
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const pathname = cleanPathname(key);
  const family = privateFamily(pathname);
  const lookup = family || pathname;
  const entry = Object.hasOwn(catalog, lookup) ? catalog[lookup] : catalog['/'];
  // Private URLs share a public-safe family card, regardless of account or route input.
  const title = (!family && options.title) || entry.title;
  const description = (!family && options.description) || entry.description;
  const canonical = family ? socialUrl(family) : canonicalUrl(options.path || pathname, pathname);
  const previews = entry.images.map((image) => ({
    url: socialUrl(image.src),
    width: image.width,
    height: image.height,
    alt: image.alt,
    type: 'image/jpeg',
  }));
  return {
    openGraph: {
      type: 'website',
      locale: 'uk_UA',
      siteName:
        pathname === '/hub' || pathname.startsWith('/hub/') ? 'ProPhoto Hub' : 'ProPhoto Academy',
      title,
      description,
      url: canonical,
      images: previews,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: previews[0].url, alt: previews[0].alt }],
    },
  };
}
