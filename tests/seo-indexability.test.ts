import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { unstable_getResponseFromNextConfig } from 'next/experimental/testing/server';
import nextConfig from '../next.config';
import fixture from '../content/academy.json';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';
import { getContent } from '../src/lib/content';
import type { AcademyContent } from '../src/lib/content/types';
import { nonIndexableRoutes } from '../src/lib/seo/crawl';
import { academyHomeSchema, academyCourseSchema } from '../src/lib/seo/structured-data';
import { academyCanonical, siteUrl } from '../src/lib/seo/urls';

vi.mock('../src/lib/content', () => ({ getContent: vi.fn() }));

const origin = 'https://prophotoacademy.com.ua';
const content = fixture as AcademyContent;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', origin);
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_URL', origin);
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'studio');
  vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', '');
  vi.stubEnv('SEO_INDEXABLE', 'true');
  vi.mocked(getContent).mockResolvedValue(content);
});
afterEach(() => vi.unstubAllEnvs());

describe('Academy crawl boundaries', () => {
  it('serves blocking head metadata to answer engines and retains search and social preview bots', () => {
    for (const agent of [
      'OAI-SearchBot',
      'ChatGPT-User',
      'PerplexityBot',
      'Perplexity-User',
      'Google-InspectionTool',
      'Mediapartners-Google',
      'Bingbot',
      'TelegramBot',
      'Viber',
      'WhatsApp',
    ]) {
      expect(`Mozilla/5.0 (compatible; ${agent}/1.0)`).toMatch(nextConfig.htmlLimitedBots!);
    }
    expect('Mozilla/5.0 GPTBot/1.0').not.toMatch(nextConfig.htmlLimitedBots!);
  });

  it('does not let CMS slugs advertise protected, noindex, redirected, or duplicate URLs', async () => {
    vi.mocked(getContent).mockResolvedValue({
      ...content,
      pages: [
        ...content.pages,
        ...[
          'login',
          'shop',
          'photo-studio',
          'courses',
          'page-in-progress',
          'hub',
          'missing/path',
          'new-public-article',
        ].map((slug) => ({ ...content.pages[0], slug })),
        content.pages[0],
      ],
    });
    const entries = await sitemap();
    const urls = entries.map(({ url }) => new URL(url).pathname);
    expect(urls).toContain('/new-public-article');
    expect(urls).toContain('/privacy-policy');
    expect(urls).toContain('/academy');
    expect(urls.filter((path) => path === '/terms-of-service')).toHaveLength(1);
    for (const forbidden of [
      '/courses',
      '/page-in-progress',
      '/login',
      '/shop',
      '/photo-studio',
      '/hub',
      '/missing/path',
    ]) {
      expect(urls).not.toContain(forbidden);
    }
    expect(robots().sitemap).toBe(origin + '/sitemap.xml');
    expect(robots().rules).toMatchObject({ disallow: expect.arrayContaining(['/api/']) });
    expect(robots().rules).not.toMatchObject({ disallow: expect.arrayContaining(['/checkout']) });
  });

  it('marks private and cookie-preview responses without marking public production pages', async () => {
    const responseFor = (path: string, cookies?: Record<string, string>) =>
      unstable_getResponseFromNextConfig({ url: origin + path, nextConfig, cookies });

    expect((await responseFor('/academy')).headers.has('x-robots-tag')).toBe(false);
    expect(
      (await responseFor('/academy', { consent: 'accepted' })).headers.has('x-robots-tag'),
    ).toBe(false);
    expect(
      (await responseFor('/academy', { __prerender_bypass: 'example' })).headers.get(
        'x-robots-tag',
      ),
    ).toContain('noindex');
    for (const path of [...nonIndexableRoutes, '/learn/course/lesson', '/api/learning/course']) {
      expect((await responseFor(path)).headers.get('x-robots-tag')).toContain('noindex');
    }
  });

  it.each(['staging', 'review'])(
    'suppresses crawl discovery for explicit %s builds',
    async (mode) => {
      if (mode === 'staging') vi.stubEnv('SEO_INDEXABLE', 'false');
      else vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', 'pages');
      expect(robots().sitemap).toBeUndefined();
      expect(await sitemap()).toEqual([]);
      expect(getContent).not.toHaveBeenCalled();
      const response = await unstable_getResponseFromNextConfig({
        url: origin + '/academy',
        nextConfig,
      });
      expect(response.headers.get('x-robots-tag')).toContain('noindex');
    },
  );
});

describe('Academy identity', () => {
  it('links the course provider to the same homepage identity and verified locality', () => {
    const [organization, website] = academyHomeSchema(content.settings, 'Фотошкола в Києві')[
      '@graph'
    ];
    const course = academyCourseSchema(content.programs[0]);
    expect(organization).toMatchObject({
      '@type': 'EducationalOrganization',
      url: origin + '/',
      telephone: content.settings.phone,
      address: {
        addressLocality: 'Київ',
        addressCountry: 'UA',
        streetAddress: 'вул. Саксаганського, 24/25',
      },
    });
    expect(website).toMatchObject({ inLanguage: 'uk', publisher: { '@id': organization['@id'] } });
    expect(course).toMatchObject({
      url: origin + '/' + content.programs[0].slug,
      provider: { '@id': organization['@id'] },
    });
    expect(course).not.toHaveProperty('offers');
    expect(organization).not.toHaveProperty('aggregateRating');
  });

  it('keeps canonical URLs independent of social assets and preserves review path boundaries', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://preview.test/Review');
    expect(academyCanonical('/academy?ref=email#courses')).toBe(origin + '/academy');
    expect(siteUrl('/social/image.jpg')).toBe('https://preview.test/Review/social/image.jpg');
    expect(siteUrl('/Review/social/image.jpg')).toBe(
      'https://preview.test/Review/social/image.jpg',
    );
    expect(siteUrl('/%2e%2e/admin')).toBe('https://preview.test/Review/');
  });
});
