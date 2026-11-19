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
    expect($.text()).toContain('13 тижнів');
    expect($.text()).not.toContain('*комерційний');
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
