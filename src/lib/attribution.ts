import type { Acquisition } from './attribution/types';

const clean = (value: string | null) =>
  value && /^[\p{L}\p{N}_.+ -]{1,100}$/u.test(value) ? value : undefined;
export function acquisitionFromUrl(value: string, site: 'academy' | 'hub'): Acquisition {
  const url = new URL(value);
  const from = url.searchParams.get('from_site');
  return {
    site,
    landingPath: url.pathname.slice(0, 200),
    utmSource: clean(url.searchParams.get('utm_source')),
    utmMedium: clean(url.searchParams.get('utm_medium')),
    utmCampaign: clean(url.searchParams.get('utm_campaign')),
    fromSite: from === 'academy' || from === 'hub' ? from : undefined,
  };
}
let firstTouch: Acquisition | undefined;
export function getAcquisition(site: 'academy' | 'hub' = 'academy') {
  if (typeof window === 'undefined') return undefined;
  firstTouch ??= acquisitionFromUrl(window.location.href, site);
  return { ...firstTouch, site };
}
export function decorateEcosystemUrl(value: string, source: Acquisition) {
  const url = new URL(
    value,
    typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3000',
  );
  url.searchParams.set('from_site', source.site);
  for (const [key, value] of [
    ['utm_source', source.utmSource],
    ['utm_medium', source.utmMedium],
    ['utm_campaign', source.utmCampaign],
  ])
    if (value && !url.searchParams.has(key!)) url.searchParams.set(key!, value);
  return url.href;
}
