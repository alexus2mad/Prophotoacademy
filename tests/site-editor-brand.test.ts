import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import type { BrandContentProps } from '../src/lib/site-editor/brand/types';
import type { SitePage } from '../src/lib/site-editor/types';
import { brandSeeds } from '../src/lib/site-editor/brand-seeds';
import { StudioHomeTemplate } from '../src/components/templates/StudioHomeTemplate/StudioHomeTemplate';
import { StudioAcademyTemplate } from '../src/components/templates/StudioAcademyTemplate/StudioAcademyTemplate';
import { StudioIntensiveTemplate } from '../src/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate';
import { StudioSpacesTemplate } from '../src/components/templates/StudioSpacesTemplate/StudioSpacesTemplate';
import { StudioShopTemplate } from '../src/components/templates/StudioShopTemplate/StudioShopTemplate';

const content = fixture as AcademyContent;
const seeds = brandSeeds(content);
function seeded(path: string) {
  return structuredClone(seeds.find((page) => page.path === path)!);
}
function edit(page: SitePage, sectionId: string, fieldId: string, value: string) {
  const section = page.sections.find((section) => section.id === sectionId)!;
  section.fields.find((field) => field.id === fieldId)!.value = value;
}
function render(path: string, page?: SitePage) {
  switch (path) {
    case '/':
      return renderToStaticMarkup(
        createElement(StudioHomeTemplate, {
          content,
          page,
          shopPage: page && seeded('/shop'),
          studioPage: page && seeded('/photo-studio'),
        }),
      );
    case '/academy':
      return renderToStaticMarkup(createElement(StudioAcademyTemplate, { content, page }));
    case '/photo-studio':
      return renderToStaticMarkup(createElement(StudioSpacesTemplate, { content, page }));
    case '/shop':
      return renderToStaticMarkup(createElement<BrandContentProps>(StudioShopTemplate, { page }));
    case '/ai-artwork':
      return renderToStaticMarkup(createElement(StudioIntensiveTemplate, { content, page }));
    default:
      throw Error(path);
  }
}

describe('Published brand page presentations', () => {
  it.each(seeds.map((page) => page.path))('renders the exact seeded markup for %s', (path) => {
    expect(render(path, seeded(path))).toEqual(render(path));
  });
  it('renders edited home photos on both breakpoints and preserves the course destination', () => {
    const page = seeded('/');
    edit(page, 'hero', 'title', 'Історії через фотографію');
    edit(page, 'hero', 'academy-0-image', '/images/new-desktop.webp');
    edit(page, 'hero', 'academy-0-mobile-image', '/images/new-mobile.webp');
    edit(page, 'works', 'work-1-image-alt', 'Золота тканина на вітрі');
    const $ = load(render('/', page));
    expect($('h1').text()).toBe('Історії через фотографію');
    const photo = $('[data-hero-visual="academy-0"]');
    expect(decodeURIComponent(photo.find('img').attr('src')!)).toContain(
      '/images/new-desktop.webp',
    );
    expect(photo.find('source').attr('srcset')).toContain('/images/new-mobile.webp');
    expect($('[data-home-section="works"] img').first().attr('alt')).toBe(
      'Золота тканина на вітрі',
    );
    expect($('[data-home-section="hero"] a').first().attr('href')).toBe('/academy');
  });
  it('changes a catalog card without changing the underlying offer or program URL', () => {
    const page = seeded('/academy');
    edit(page, 'catalog-program-commercial', 'title', 'Новий заголовок курсу');
    edit(page, 'catalog-program-commercial', 'image', '/images/catalog.webp');
    const before = load(render('/academy'));
    const after = load(render('/academy', page));
    const oldRow = before('#courses a').first();
    const newRow = after('#courses a').first();
    expect(newRow.find('h3').text()).toBe('Новий заголовок курсу');
    expect(decodeURIComponent(newRow.find('img').attr('src')!)).toContain('/images/catalog.webp');
    expect(newRow.attr('href')).toBe(oldRow.attr('href'));
    expect(newRow.find('p').last().text()).toBe(oldRow.find('p').last().text());
  });
  it('changes a workshop lesson outline and gallery while preserving ticket information', () => {
    const page = seeded('/ai-artwork');
    edit(page, 'curriculum', 'block-1-title', 'Композиція у студії');
    edit(page, 'workshop', 'work-0-image-alt', 'Приклад авторської зйомки');
    const before = load(render('/ai-artwork'));
    const after = load(render('/ai-artwork', page));
    expect(after('#intensive-program details').eq(1).find('h3').text()).toBe('Композиція у студії');
    expect(after('img[alt="Приклад авторської зйомки"]').length).toBeGreaterThan(0);
    expect(after('#intensive-offers').html()).toBe(before('#intensive-offers').html());
  });
  it('applies edited testimonial copy and preserves the attribution link', () => {
    const page = seeded('/');
    const first = page.sections.find((section) => section.id.startsWith('review-testimonial-'))!;
    edit(page, first.id, 'quote', 'Після курсу я самостійно знімаю для власного бренду.');
    const selector = '[data-home-section="reviews"] article';
    const before = load(render('/'))(selector).first();
    const after = load(render('/', page))(selector).first();
    expect(after.text()).toContain('Після курсу я самостійно знімаю для власного бренду.');
    expect(after.find('a').attr('href')).toBe(before.find('a').attr('href'));
  });
});
