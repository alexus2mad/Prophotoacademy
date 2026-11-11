import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { academyProgramsHref } from '../src/lib/navigation/academy';
import { getContent } from '../src/lib/content';
import Checkout from '../src/app/(academy)/checkout/page';
import Thanks from '../src/app/(academy)/thanks/page';
import Detail from '../src/app/(academy)/[slug]/page';
import NotFound from '../src/app/not-found';
import { StudentOverview } from '../src/components/organisms/StudentOverview/StudentOverview';
import { OrderStatus } from '../src/components/organisms/OrderStatus/OrderStatus';
import { InquiryDialog } from '../src/components/organisms/InquiryDialog/InquiryDialog';
import { ReviewUnavailableTemplate } from '../src/components/templates/ReviewUnavailableTemplate/ReviewUnavailableTemplate';

vi.mock('next/server', () => ({ connection: vi.fn(async () => undefined) }));
vi.mock('next/font/local', () => ({ default: () => ({ variable: 'font-test' }) }));
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/missing',
}));
vi.mock('../src/lib/content', async () => ({
  getContent: vi.fn(),
  findImage: (await import('../src/lib/content/selectors')).findImage,
}));
vi.mock('../src/lib/auth/server', () => ({ currentMember: vi.fn(async () => undefined) }));
vi.mock('../src/lib/commerce/orders', () => ({ purchaseAccess: vi.fn() }));
vi.mock('../src/lib/commerce/catalog', () => ({
  enrollmentOptions: vi.fn(async () => ({ mode: 'mock', packageIds: [] })),
}));
vi.mock('../src/components/organisms/InquiryDialog/hooks', () => ({
  useInquiryDialog: () => ({
    dialog: { current: null },
    context: { practiceSessionId: 'synthetic-practice' },
    state: 'idle',
    fieldErrors: {},
    submit: vi.fn(),
  }),
}));

const content = fixture as AcademyContent;
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://prophotoacademy.com.ua');
  vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', '');
  vi.stubEnv('PAYMENT_MODE', 'mock');
  vi.mocked(getContent).mockResolvedValue(content);
});
afterEach(() => vi.unstubAllEnvs());

describe.each([
  ['studio', '/academy'],
  ['legacy', '/courses'],
] as const)('%s shared Academy destinations', (design, destination) => {
  beforeEach(() => vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', design));

  it('resolves the approved index directly without a compatibility redirect', () => {
    expect(academyProgramsHref()).toBe(destination);
  });

  it('preserves repeated attribution and safely encoded queries with a Studio-only course anchor', () => {
    const query = new URLSearchParams([
      ['category', 'course'],
      ['utm_source', 'instagram'],
      ['utm_source', 'email'],
      ['next', '//other.test/#outside'],
    ]);
    const suffix = design === 'studio' ? '#courses' : '';
    expect(academyProgramsHref(query)).toBe(`${destination}?${query.toString()}${suffix}`);
    expect(query.getAll('utm_source')).toEqual(['instagram', 'email']);
  });

  it('uses that destination in student empty states, payment status, 404 and review fallback', () => {
    const surfaces = [
      createElement(StudentOverview, { name: '', courses: [] }),
      createElement(OrderStatus, { token: 'synthetic-token' }),
      createElement(NotFound),
      createElement(ReviewUnavailableTemplate, { title: 'Перевірка', description: 'Огляд' }),
    ];
    for (const surface of surfaces) {
      const $ = load(renderToStaticMarkup(surface));
      expect($(`a[href="${destination}"]`)).toHaveLength(1);
      if (design === 'studio') expect($('a[href^="/courses"]')).toHaveLength(0);
    }
  });

  it('returns unsuccessful checkout and missing-order visitors to the same approved destination', async () => {
    const surfaces = [
      await Checkout({
        searchParams: Promise.resolve({ offering: 'missing', package: 'missing' }),
      }),
      await Thanks({ searchParams: Promise.resolve({}) }),
    ];
    for (const surface of surfaces) {
      const $ = load(renderToStaticMarkup(surface));
      expect($(`a[href="${destination}"]`)).toHaveLength(1);
      if (design === 'studio') expect($('a[href^="/courses"]')).toHaveLength(0);
    }
  });

  it('uses the variant destination in the online alternative inside a practice inquiry', () => {
    const $ = load(renderToStaticMarkup(createElement(InquiryDialog)));
    const link = $('.practice-online-alternative a').attr('href')!;
    expect(new URL(link, 'https://prophotoacademy.com.ua').pathname).toBe(destination);
  });

  it('keeps course back-navigation consistent without changing its structured-data canonical URL', async () => {
    const program = content.programs.find((item) => item.slug === 'visual-content')!;
    const $ = load(
      renderToStaticMarkup(await Detail({ params: Promise.resolve({ slug: program.slug }) })),
    );
    const back = design === 'studio' ? '/academy#courses' : '/courses';
    expect($(`a[href="${back}"]`).length).toBeGreaterThan(0);
    if (design === 'studio') expect($('a[href^="/courses"]')).toHaveLength(0);
    const schema = JSON.parse($('script[type="application/ld+json"]').text());
    expect(schema['@type']).toBe('Course');
    expect(schema.url).toBe('https://prophotoacademy.com.ua/visual-content');
    expect(schema.provider.url).toBe('https://prophotoacademy.com.ua');
    expect(JSON.stringify(schema)).not.toContain('/courses');
  });
});
