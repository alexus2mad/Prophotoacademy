import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { getContent } from '../src/lib/content';
import Courses, { generateMetadata } from '../src/app/(academy)/courses/page';
import sitemap from '../src/app/sitemap';
import { CatalogTemplate } from '../src/components/templates/CatalogTemplate/CatalogTemplate';
import { StudioAcademyTemplate } from '../src/components/templates/StudioAcademyTemplate/StudioAcademyTemplate';
import { StudioHeader } from '../src/components/organisms/StudioHeader/StudioHeader';
import { StudioFooter } from '../src/components/organisms/StudioFooter/StudioFooter';
import { StudioHomeHero } from '../src/components/organisms/StudioHomeHero/StudioHomeHero';
import { StudioHomeDirections } from '../src/components/organisms/StudioHomeDirections/StudioHomeDirections';
import { StudioHomeFounder } from '../src/components/organisms/StudioHomeFounder/StudioHomeFounder';
import { StudioHomeWorks } from '../src/components/organisms/StudioHomeWorks/StudioHomeWorks';
import { studioHomeDirections } from '../src/lib/studio-home/selectors';
import { studioCatalogDestination } from '../src/lib/studio-pages/navigation';

vi.mock('next/server', () => ({ connection: vi.fn(async () => undefined) }));
vi.mock('next/navigation', async (importOriginal) => {
  const navigation = await importOriginal<typeof import('next/navigation')>();
  return { ...navigation, redirect: vi.fn(navigation.redirect), usePathname: () => '/academy' };
});
vi.mock('../src/lib/content', () => ({ getContent: vi.fn() }));
vi.mock('../src/components/templates/CatalogTemplate/CatalogTemplate', () => ({
  CatalogTemplate: vi.fn(() => null),
}));
vi.mock('../src/components/templates/StudioAcademyTemplate/StudioAcademyTemplate', () => ({
  StudioAcademyTemplate: vi.fn(() => null),
}));

const content = fixture as AcademyContent;
const production = 'https://prophotoacademy.com.ua';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'studio');
  vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', '');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', production);
  vi.mocked(getContent).mockResolvedValue(content);
});
afterEach(() => vi.unstubAllEnvs());

describe('one approved Studio Academy destination', () => {
  it('temporarily redirects the saved catalog URL before rendering or fetching its duplicate page', async () => {
    await expect(Courses({ searchParams: Promise.resolve({}) })).rejects.toMatchObject({
      digest: 'NEXT_REDIRECT;replace;/academy;307;',
    });
    expect(connection).toHaveBeenCalledOnce();
    expect(getContent).not.toHaveBeenCalled();
  });

  it('keeps repeated campaign parameters and anchors course-filter links at the main courses', async () => {
    const query = { category: 'course', utm_source: ['instagram', 'newsletter'], empty: undefined };
    const destination =
      '/academy?category=course&utm_source=instagram&utm_source=newsletter#courses';
    await expect(Courses({ searchParams: Promise.resolve(query) })).rejects.toMatchObject({
      digest: `NEXT_REDIRECT;replace;${destination};307;`,
    });
    expect(redirect).toHaveBeenCalledWith(destination);
    expect(getContent).not.toHaveBeenCalled();
  });

  it('encodes arbitrary query data while keeping the destination on the Academy origin', () => {
    const query = new URLSearchParams([
      ['category', 'course'],
      ['utm_campaign', 'Світло & композиція'],
      ['utm_campaign', '#courses?<script>alert(1)</script>'],
      ['next', 'https://other.example/path?x=1&y=2'],
    ]);
    const original = query.toString();
    const destination = studioCatalogDestination(query);
    const parsed = new URL(destination, production);
    expect(parsed.origin).toBe(production);
    expect(parsed.pathname).toBe('/academy');
    expect(parsed.hash).toBe('#courses');
    expect(parsed.searchParams.getAll('utm_campaign')).toEqual(query.getAll('utm_campaign'));
    expect(parsed.searchParams.get('next')).toBe(query.get('next'));
    expect(destination).not.toContain('<script>');
    expect(destination).not.toContain('Світло &');
    expect(query.toString()).toBe(original);
  });

  it.each(['class', 'individual', 'unknown', 'course#other'])(
    'keeps the Academy overview for the historical %s filter',
    (category) => {
      const parsed = new URL(
        studioCatalogDestination(new URLSearchParams({ category })),
        production,
      );
      expect(parsed.pathname).toBe('/academy');
      expect(parsed.hash).toBe('');
      expect(parsed.searchParams.get('category')).toBe(category);
    },
  );

  it('renders the approved Academy template in the static review without a server redirect', async () => {
    vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', 'pages');
    const page = await Courses({ searchParams: Promise.resolve({ category: 'course' }) });
    expect(page.type).toBe(StudioAcademyTemplate);
    expect(page.props.content).toBe(content);
    expect(connection).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
    expect(getContent).toHaveBeenCalledOnce();
  });

  it('preserves the legacy catalog, its query and original metadata for future design tests', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'legacy');
    const page = await Courses({
      searchParams: Promise.resolve({ category: 'course', utm_source: ['first', 'second'] }),
    });
    expect(page.type).toBe(CatalogTemplate);
    expect(page.props.content).toBe(content);
    expect(page.props.programs).toHaveLength(content.programs.length);
    expect(page.props.query).toBe('category=course&utm_source=first&utm_source=second');
    expect(redirect).not.toHaveBeenCalled();
    expect(generateMetadata()).toMatchObject({
      title: 'Усі програми',
      description:
        'Оберіть курс фотографії, комерційного контенту чи Instagram. Класи, індивідуальне та корпоративне навчання.',
      alternates: { canonical: '/courses' },
      openGraph: { url: `${production}/courses` },
    });
  });

  it.each(['studio', 'legacy'] as const)(
    'publishes one canonical catalog in the %s sitemap',
    async (design) => {
      vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', design);
      const canonical = design === 'studio' ? '/academy' : '/courses';
      const duplicate = design === 'studio' ? '/courses' : '/academy';
      expect(generateMetadata()).toMatchObject({
        alternates: { canonical },
        openGraph: { url: production + canonical },
      });
      const entries = await sitemap();
      expect(entries.filter((entry) => entry.url === production + canonical)).toHaveLength(1);
      expect(entries.some((entry) => entry.url === production + duplicate)).toBe(false);
    },
  );
});

describe('direct Studio learning navigation', () => {
  it('keeps header and footer course links on the approved page without visiting the alias', () => {
    for (const component of [StudioHeader, StudioFooter]) {
      const $ = load(
        renderToStaticMarkup(createElement(component, { settings: content.settings })),
      );
      expect($('a[href="/academy"]').length).toBeGreaterThan(0);
      expect($('a[href="/academy#courses"]').length).toBeGreaterThan(0);
      expect($('a[href^="/courses"]')).toHaveLength(0);
    }
  });

  it('takes the Academy hero to its overview and the course card directly to its course section', () => {
    const hero = load(
      renderToStaticMarkup(
        createElement(StudioHomeHero, { mode: 'academy', onModeChange: vi.fn() }),
      ),
    );
    expect(hero('a')).toHaveLength(1);
    expect(hero('a').attr('href')).toBe('/academy');
    const directions = load(
      renderToStaticMarkup(
        createElement(StudioHomeDirections, {
          mode: 'academy',
          directions: studioHomeDirections(content),
        }),
      ),
    );
    expect(directions('a[aria-label="Курси: Усі курси"]').attr('href')).toBe('/academy#courses');
    expect(directions('a[aria-label="Воркшопи: Усі воркшопи"]').attr('href')).toBe(
      '/academy#workshops',
    );
    expect(directions('a[href^="/courses"]')).toHaveLength(0);
  });

  it('uses the course section for the founder and student-work calls to action', () => {
    for (const element of [
      createElement(StudioHomeFounder),
      createElement(StudioHomeWorks, { works: [] }),
    ]) {
      const $ = load(renderToStaticMarkup(element));
      expect($('a[href="/academy#courses"]')).toHaveLength(1);
      expect($('a[href^="/courses"]')).toHaveLength(0);
    }
  });
});
