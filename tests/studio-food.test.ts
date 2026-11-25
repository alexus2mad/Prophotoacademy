import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import nextConfig from '../next.config';
import type { AcademyContent } from '../src/lib/content/types';
import { getContent } from '../src/lib/content';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import Detail from '../src/app/(academy)/[slug]/page';
import { foodEditorial } from '../src/lib/studio-food/content';

vi.mock('../src/lib/content', () => ({ getContent: vi.fn() }));
vi.mock('../src/lib/commerce/catalog', () => ({ enrollmentOptions: vi.fn() }));
vi.mock('next/server', () => ({ connection: vi.fn() }));

const content = fixture as AcademyContent;
const program = content.programs.find((item) => item.id === 'program-food')!;
const offering = content.offerings.find((item) => item.programId === program.id)!;

async function render() {
  const html = renderToStaticMarkup(
    await Detail({ params: Promise.resolve({ slug: 'food-product-photography' }) }),
  );
  return load(html);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'studio');
  vi.mocked(getContent).mockResolvedValue(content);
  vi.mocked(enrollmentOptions).mockResolvedValue({
    mode: 'mock',
    packageIds: offering.packages.map((pack) => pack.id),
  });
});
afterEach(() => vi.unstubAllEnvs());

describe('Food and product photography course page', () => {
  it('renders the Creator layout with the food course copy and no lecturer section', async () => {
    const $ = await render();
    expect($('[data-course-design="creator"]')).toHaveLength(1);
    expect($('h1').text()).toBe('*предметна таФуд-зйомка');
    expect($('#program-lecturers')).toHaveLength(0);
    expect($.text()).toContain('40+ лекцій');
    expect($.text()).toContain('12 тижнів');
    expect($.text()).not.toContain('13 тижнів');
    expect($.text()).not.toContain('*комерційний');
    const heroActions = $('[aria-labelledby="creator-title"] .studio-actions a');
    expect(heroActions.map((_, link) => $(link).attr('href')).get()).toEqual([
      '#packages',
      '#program-curriculum',
    ]);
  });

  it('numbers the curriculum weeks 1 to 12 without a gap', async () => {
    const weeks = program.modules
      .map((module) => /^Тиждень (\d+)/.exec(module.title)?.[1])
      .filter(Boolean)
      .map(Number);
    expect(weeks).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
  });

  it('embeds the approved video just below the early package action', async () => {
    const $ = await render();
    const video = $('#program-about a[href="#packages"] + iframe');
    expect(video).toHaveLength(1);
    expect(video.attr('src')).toBe(
      'https://www.youtube-nocookie.com/embed/f1a-B-s8Hkg?rel=0&playsinline=1',
    );
    expect(video.attr('title')).toContain('Вітальне відео');
    expect(video.attr('loading')).toBe('lazy');
  });

  it('lists every audience card, benefit and curriculum week from the course brief', async () => {
    const $ = await render();
    expect($('#program-audience ol > li')).toHaveLength(foodEditorial.audience.length);
    expect($('#program-audience').text()).toContain('01 / 06');
    for (const benefit of foodEditorial.benefits) expect($.text()).toContain(benefit.title);
    expect(
      $('#program-curriculum h3')
        .map((_, node) => $(node).text())
        .get(),
    ).toEqual(program.modules.map((module) => module.title));
  });

  it('offers the three open packages at their real prices through checkout', async () => {
    const $ = await render();
    for (const pack of offering.packages) {
      expect($(`a[href*="package=${pack.id}"]`).length).toBeGreaterThan(0);
    }
    expect($('#packages').text()).toContain('59 999');
    expect($('[data-installment-methods]').length).toBeGreaterThan(0);
  });

  it('shows the installment notice under each package price', async () => {
    const $ = await render();
    $('#packages .package-card').each((_, card) => {
      const notice = $(card).find('.price').next();
      expect(notice.find('[data-installment-methods]')).toHaveLength(1);
      expect(notice.text()).toContain('Є оплата частинами');
      expect($(card).find('.package-action [data-installment-methods]')).toHaveLength(0);
    });
  });

  it('presents the 31 curated Food photographs as one numbered gallery before the curriculum', async () => {
    const $ = await render();
    expect($('#student-works [aria-pressed]')).toHaveLength(0);
    expect($('#student-works > div > [aria-live]').text()).toBe('1 / 31');
    const phone = program.workIds.flatMap(
      (id) => content.works.find((work) => work.id === id && work.device === 'phone') ?? [],
    );
    expect(phone).toHaveLength(31);
    expect(phone.slice(0, 3).map((work) => work.id)).toEqual([
      'food-chocolate-pattern',
      'food-spice-test-tubes',
      'food-water-glass-splash',
    ]);
    expect(phone.at(-1)?.id).toBe('food-glass-splash-landscape');
    expect(
      $('#creator-work-rail img')
        .map((_, node) => $(node).attr('data-site-field'))
        .get(),
    ).toEqual(phone.map((work) => work.imageId));
    expect($('#creator-work-rail button[aria-haspopup="dialog"]')).toHaveLength(31);
    expect($('#student-works').prev().attr('data-site-section')).toBe('benefits');
    expect($('#student-works').next().attr('id')).toBe('program-curriculum');
    expect($('#student-works [data-site-field="description"]').text()).toBe(
      'Кожна робота — шлях від «як налаштувати камеру» до розуміння композиції, світла, кольору й ідеї зйомки.',
    );
  });

  it('shows only the food course works in the rail', async () => {
    const $ = await render();
    const rail = $('#creator-work-rail img');
    expect(rail.length).toBeGreaterThan(0);
    rail.each((_, image) => {
      expect(decodeURIComponent($(image).attr('src') ?? '')).toContain('/images/studio/food/');
    });
  });

  it('permanently redirects the previous food course URL', async () => {
    expect(await nextConfig.redirects!()).toContainEqual({
      source: '/food-photography',
      destination: '/food-product-photography',
      permanent: true,
    });
  });
});
