import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import images from '../src/lib/social-images/images.json';
import type { AcademyContent } from '../src/lib/content/types';
import type { SocialImageEntry } from '../src/lib/social-images/types';
import { socialMetadata, socialUrl } from '../src/lib/social-images/metadata';
import { getContent } from '../src/lib/content';
import sitemap from '../src/app/sitemap';
import { generateMetadata as programMetadata } from '../src/app/(academy)/[slug]/page';
import { generateMetadata as hubMetadata } from '../src/app/hub/[slug]/page';

vi.mock('../src/lib/content', () => ({ getContent: vi.fn() }));
vi.mock('../src/lib/commerce/catalog', () => ({ enrollmentOptions: vi.fn() }));
vi.mock('../src/components/templates/ProgramTemplate/ProgramTemplate', () => ({
  ProgramTemplate: vi.fn(() => null),
}));
vi.mock('../src/components/templates/StudioProgramTemplate/StudioProgramTemplate', () => ({
  StudioProgramTemplate: vi.fn(() => null),
}));
vi.mock('../src/components/templates/RoomTemplate/RoomTemplate', () => ({
  RoomTemplate: vi.fn(() => null),
}));
vi.mock('../src/components/templates/PracticeTemplate/PracticeTemplate', () => ({
  PracticeTemplate: vi.fn(() => null),
}));

const catalog: Record<string, SocialImageEntry> = images;
const content = fixture as AcademyContent;
const production = 'https://prophotoacademy.com.ua';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', production);
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'studio');
  vi.mocked(getContent).mockResolvedValue(content);
});
afterEach(() => vi.unstubAllEnvs());

describe('social image URL boundaries', () => {
  it.each([
    [production, '/social/example-wide.jpg', production + '/social/example-wide.jpg'],
    [production + '/', '/courses', production + '/courses'],
    [
      'https://alexus2mad.github.io/Prophotoacademy',
      '/social/example-wide.jpg',
      'https://alexus2mad.github.io/Prophotoacademy/social/example-wide.jpg',
    ],
    [
      'https://alexus2mad.github.io/Prophotoacademy/',
      '/Prophotoacademy/social/example-wide.jpg',
      'https://alexus2mad.github.io/Prophotoacademy/social/example-wide.jpg',
    ],
    [production, '/courses?utm_source=test#programs', production + '/courses'],
  ])('resolves %s and %s without duplicated prefixes or tracking data', (base, path, expected) => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', base);
    expect(socialUrl(path)).toBe(expected);
  });

  it('uses production and review image URLs consistently in both sharing protocols', () => {
    for (const base of [production, 'https://alexus2mad.github.io/Prophotoacademy']) {
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', base);
      const metadata = socialMetadata('/ai-artwork');
      expect(metadata.openGraph).toMatchObject({
        type: 'website',
        locale: 'uk_UA',
        url: base + '/ai-artwork',
        images: [
          { url: base + images['/ai-artwork'].images[0].src, width: 1200, height: 630 },
          { url: base + images['/ai-artwork'].images[1].src, width: 630, height: 630 },
        ],
      });
      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        images: [{ url: base + images['/ai-artwork'].images[0].src }],
      });
    }
  });

  it('uses the branded fallback for a new public slug while retaining its actual public title', () => {
    const metadata = socialMetadata('/new-workshop?utm_source=telegram#details', {
      title: 'Новий воркшоп',
      description: 'Опис нової публічної програми',
    });
    expect(metadata.openGraph).toMatchObject({
      title: 'Новий воркшоп',
      description: 'Опис нової публічної програми',
      url: production + '/new-workshop',
    });
    expect(metadata.openGraph?.images).toEqual(socialMetadata('/').openGraph?.images);
    expect(() => socialMetadata('__proto__')).not.toThrow();
    expect(() => socialMetadata('constructor')).not.toThrow();
  });

  it('keeps Hub identity and canonical destination while serving images from the Academy origin', () => {
    const metadata = socialMetadata('/hub/mainhall', {
      path: 'https://prophotohub.com.ua/mainhall?utm_source=academy#gallery',
    });
    expect(metadata.openGraph).toMatchObject({
      siteName: 'ProPhoto Hub',
      url: 'https://prophotohub.com.ua/mainhall',
      images: [{ url: production + images['/hub/mainhall'].images[0].src }, {}],
    });
    expect(socialMetadata('/hubspot').openGraph).toMatchObject({ siteName: 'ProPhoto Academy' });
  });

  it('rejects credential-bearing site configuration and ignores credential-bearing canonicals', () => {
    expect(
      socialMetadata('/hub', { path: 'https://user:secret@example.test/room' }).openGraph,
    ).toMatchObject({ url: production + '/hub' });
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://user:secret@example.test');
    expect(() => socialMetadata('/')).toThrow('without credentials');
  });
});

describe('page coverage and integration', () => {
  it('provides a distinct authored preview for every current indexable Academy URL', async () => {
    const routes = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(routes).toHaveLength(16);
    const primaryImages = routes.map((route) => {
      expect(Object.hasOwn(catalog, route), route).toBe(true);
      const entry = catalog[route];
      expect(entry.title.trim()).not.toBe('');
      expect(entry.description.trim()).not.toBe('');
      return entry.images[0].src;
    });
    expect(new Set(primaryImages).size).toBe(routes.length);
  });

  it.each([...content.programs, ...content.pages].map((page) => page.slug))(
    'binds the %s content route to its own public preview and current SEO title',
    async (slug) => {
      const page = [...content.programs, ...content.pages].find((item) => item.slug === slug)!;
      const metadata = await programMetadata({ params: Promise.resolve({ slug }) });
      const title = ('seo' in page ? page.seo?.title : undefined) || page.title;
      expect(metadata.title).toBe(title);
      expect(metadata.alternates?.canonical).toBe('/' + slug);
      expect(metadata.openGraph).toMatchObject({
        title,
        url: production + '/' + slug,
        images: [{ url: production + catalog['/' + slug].images[0].src }, {}],
      });
    },
  );

  it('preserves updated public CMS SEO rather than replacing it with the generated image caption', async () => {
    const content = structuredClone(fixture) as AcademyContent;
    content.programs[0].seo = { title: 'Оновлена назва курсу', description: 'Оновлений опис' };
    vi.mocked(getContent).mockResolvedValue(content);
    const metadata = await programMetadata({
      params: Promise.resolve({ slug: content.programs[0].slug }),
    });
    expect(metadata.openGraph).toMatchObject({
      title: 'Оновлена назва курсу',
      description: 'Оновлений опис',
    });
    expect(metadata.twitter).toMatchObject({
      title: 'Оновлена назва курсу',
      description: 'Оновлений опис',
    });
  });

  it('does not invent a public page for an unknown course slug', async () => {
    expect(await programMetadata({ params: Promise.resolve({ slug: 'missing-course' }) })).toEqual(
      {},
    );
  });

  it.each([...fixture.rooms, ...fixture.practiceSessions].map((item) => item.slug))(
    'binds Hub route %s to its own branded image',
    async (slug) => {
      const metadata = await hubMetadata({ params: Promise.resolve({ slug }) });
      expect(metadata.openGraph).toMatchObject({
        siteName: 'ProPhoto Hub',
        images: [{ url: production + catalog['/hub/' + slug].images[0].src }, {}],
      });
    },
  );
});

describe('private previews', () => {
  it.each([
    ['/account?email=person@example.test', '/account'],
    ['/account/purchases?order=private-order', '/account'],
    ['/admin/students/person@example.test', '/admin'],
    ['/admin/courses/private-course/preview/private-lesson', '/admin'],
    ['/learn/private-course/private-lesson', '/learn'],
    ['/login?next=/admin&code=private-code', '/login'],
    ['/checkout?package=private-package', '/checkout'],
    ['/thanks?token=private-token', '/thanks'],
    ['/demo/admin/students/person@example.test', '/admin'],
    ['/demo/learn/private-lesson', '/learn'],
    ['/demo/account', '/account'],
    ['/studio/private-draft', '/admin'],
    ['/operations', '/admin'],
  ])('maps %s to generic %s metadata without echoing private input', (path, family) => {
    const metadata = socialMetadata(path, {
      title: 'person@example.test',
      description: 'private-lesson private-order',
      path: 'https://private.example.test/secret?token=private-token',
    });
    expect(metadata).toEqual(socialMetadata(family));
    expect(JSON.stringify(metadata)).not.toMatch(/person@example|private-|secret|token=|code=/);
    expect(metadata.openGraph).toMatchObject({ url: production + family });
  });

  it('keeps account, administration and learning layouts non-indexable with family cards', async () => {
    const modules = [
      [await import('../src/app/account/layout'), '/account'],
      [await import('../src/app/admin/layout'), '/admin'],
      [await import('../src/app/learn/layout'), '/learn'],
    ] as const;
    for (const [route, key] of modules) {
      expect(route.metadata.robots).toEqual({ index: false, follow: false });
      expect(route.metadata.openGraph?.images).toEqual(socialMetadata(key).openGraph?.images);
    }
  });
});
