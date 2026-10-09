import type { PracticeSession, SiteBrand } from './content/types';

export const academyOrigin = process.env.NEXT_PUBLIC_ACADEMY_URL || '';
export const hubOrigin = process.env.NEXT_PUBLIC_HUB_URL || '/hub';
export function siteHref(site: SiteBrand, path = '') {
  const base = site === 'hub' ? hubOrigin : academyOrigin;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
export function canonicalUrl(site: SiteBrand, path = '') {
  return new URL(siteHref(site, path), process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000')
    .href;
}
export function isHubHost(host: string) {
  if (process.env.PROPHOTO_SITE === 'hub') return true;
  if (process.env.PROPHOTO_SITE === 'academy') return false;
  const configured = process.env.NEXT_PUBLIC_HUB_URL;
  if (!configured?.startsWith('https://') && !configured?.startsWith('http://')) return false;
  const name = host
    .split(':')[0]
    .toLowerCase()
    .replace(/^www\./, '');
  return name === new URL(configured).hostname.toLowerCase().replace(/^www\./, '');
}
export function hubRewritePath(path: string) {
  if (
    /^\/(api|_next|images|brand|studio|operations|account|login|learn|admin|demo)(\/|$)/.test(path)
  )
    return undefined;
  if (path.startsWith('/hub/') || path === '/hub') return undefined;
  return `/hub${path === '/' ? '' : path}`;
}
export function readyPractice(session: PracticeSession) {
  return (
    session.status === 'open' &&
    session.verified &&
    !!session.duration &&
    !!session.capacity &&
    !!session.price &&
    !!session.date &&
    session.date >= new Date().toISOString().slice(0, 10) &&
    !!session.equipment?.length &&
    !!session.preparation?.length &&
    !!session.deliverables?.length
  );
}
