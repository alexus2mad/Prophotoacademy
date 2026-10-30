import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { CatalogTemplate } from '../src/components/templates/CatalogTemplate/CatalogTemplate';

vi.mock('../src/components/organisms/ProgramCatalog/ProgramCatalog', () => ({
  ProgramCatalog: () => {
    throw new Promise(() => {});
  },
}));

const content = fixture as AcademyContent;

describe('catalog before client navigation is ready', () => {
  it('renders the requested category and keeps attribution when clearing it', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(CatalogTemplate, {
          content,
          programs: content.programs,
          query: 'category=course&utm_source=stage2-check&tag=one&tag=two',
        }),
      ),
    );
    expect($('[data-catalog-category]').attr('data-catalog-category')).toBe('course');
    expect($('.course-card')).toHaveLength(3);
    expect($('nav[aria-label="Категорії програм"] a').first().attr('href')).toBe(
      '/courses?utm_source=stage2-check&tag=one&tag=two',
    );
    expect($('nav[aria-label="Категорії програм"] a[aria-current="page"]').text()).toBe('Курси');
  });

  it('keeps the static review fallback complete when request parameters are unavailable', () => {
    const $ = load(
      renderToStaticMarkup(createElement(CatalogTemplate, { content, programs: content.programs })),
    );
    expect($('[data-catalog-category]').attr('data-catalog-category')).toBe('all');
    expect($('.course-card')).toHaveLength(content.programs.length);
    expect($('nav[aria-label="Категорії програм"] a').first().attr('href')).toBe('/courses');
  });
});
