import { afterEach, describe, expect, it, vi } from 'vitest';
import { hubRewritePath, isHubHost, readyPractice, siteHref } from '../src/lib/ecosystem';
import type { PracticeSession } from '../src/lib/content/types';
import { NextRequest } from 'next/server';
import { proxy } from '../src/proxy';
afterEach(() => vi.unstubAllEnvs());
describe('separate ecosystem destinations', () => {
  it('allows the internal Hub rewrite to resolve without redirecting back to itself', () => {
    vi.stubEnv('PROPHOTO_SITE', 'hub');
    const first = proxy(new NextRequest('https://www.prophotohub.com.ua/'));
    expect(first.headers.get('x-middleware-rewrite')).toBe('https://www.prophotohub.com.ua/hub');
    const second = proxy(new NextRequest('https://www.prophotohub.com.ua/hub'));
    expect(second.headers.get('location')).toBeNull();
    expect(second.headers.get('x-middleware-next')).toBe('1');
  });
  it('uses distinct configured domains for production navigation', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_URL', 'https://www.prophotoacademy.com.ua');
    vi.stubEnv('NEXT_PUBLIC_HUB_URL', 'https://www.prophotohub.com.ua');
    vi.resetModules();
    const configured = await import('../src/lib/ecosystem');
    expect(configured.siteHref('academy', 'courses')).toBe(
      'https://www.prophotoacademy.com.ua/courses',
    );
    expect(configured.canonicalUrl('hub', 'booking?room=podcast')).toBe(
      'https://www.prophotohub.com.ua/booking?room=podcast',
    );
  });
  it('offers both sites directly in local review', () => {
    expect(siteHref('academy', 'courses')).toBe('/courses');
    expect(siteHref('hub', 'booking?room=podcast')).toBe('/hub/booking?room=podcast');
  });
  it('rewrites Hub public pages without changing APIs or assets', () => {
    expect(hubRewritePath('/')).toBe('/hub');
    expect(hubRewritePath('/booking')).toBe('/hub/booking');
    expect(hubRewritePath('/sitemap.xml')).toBe('/hub/sitemap.xml');
    for (const path of [
      '/api/inquiries',
      '/_next/static/a.js',
      '/studio',
      '/operations',
      '/images/x.webp',
      '/hub/mainhall',
    ])
      expect(hubRewritePath(path)).toBeUndefined();
  });
  it('only uses the configured Hub domain or explicit deployment mode', () => {
    vi.stubEnv('NEXT_PUBLIC_HUB_URL', 'https://www.prophotohub.com.ua');
    expect(isHubHost('prophotohub.com.ua')).toBe(true);
    expect(isHubHost('www.prophotohub.com.ua:443')).toBe(true);
    expect(isHubHost('unrelated.example')).toBe(false);
    vi.stubEnv('PROPHOTO_SITE', 'academy');
    expect(isHubHost('prophotohub.com.ua')).toBe(false);
  });
});
describe('practice publication gate', () => {
  const ready: PracticeSession = {
    id: 'session',
    slug: 'session',
    title: 'Session',
    description: 'Description',
    programIds: [],
    roomId: 'room',
    imageId: 'image',
    status: 'open',
    verified: true,
    duration: '3 hours',
    capacity: 6,
    price: 1000,
    date: '2099-01-01',
    equipment: ['Light'],
    preparation: ['Brief'],
    deliverables: ['Own images'],
  };
  it('requires operational confirmation and all promised details', () => {
    expect(readyPractice(ready)).toBe(true);
    for (const change of [
      { verified: false },
      { status: 'planning' as const },
      { date: '2020-01-01' },
      { capacity: undefined },
      { price: undefined },
      { equipment: [] },
      { preparation: [] },
      { deliverables: [] },
    ])
      expect(readyPractice({ ...ready, ...change })).toBe(false);
  });
});
