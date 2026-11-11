import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { StudioHeader } from '../src/components/organisms/StudioHeader/StudioHeader';
import { StudioFooter } from '../src/components/organisms/StudioFooter/StudioFooter';
import { StudioHomeHero } from '../src/components/organisms/StudioHomeHero/StudioHomeHero';
import { StudioHomeBanner } from '../src/components/organisms/StudioHomeBanner/StudioHomeBanner';
import { StudioHomeDirections } from '../src/components/organisms/StudioHomeDirections/StudioHomeDirections';

vi.mock('next/navigation', () => ({ usePathname: () => '/academy' }));

const content = fixture as AcademyContent;

it('takes header, menu and footer visitors to the existing Studio and Shop websites', () => {
  for (const component of [StudioHeader, StudioFooter]) {
    const $ = load(renderToStaticMarkup(createElement(component, { settings: content.settings })));
    expect($('a[href="https://prophotohub.com.ua"]').length).toBeGreaterThan(0);
    expect($('a[href="https://prophotoshop.com.ua"]').length).toBeGreaterThan(0);
    expect($('a[href^="/photo-studio"], a[href^="/shop"]')).toHaveLength(0);
    expect($('a[href="/academy"]').length).toBeGreaterThan(0);
  }
});

it.each([
  ['studio', 'https://prophotohub.com.ua/booking'],
  ['shop', 'https://prophotoshop.com.ua'],
  ['academy', '/courses'],
] as const)('keeps the %s hero action on its intended customer journey', (mode, href) => {
  const $ = load(
    renderToStaticMarkup(createElement(StudioHomeHero, { mode, onModeChange: vi.fn() })),
  );
  expect($('a')).toHaveLength(1);
  expect($('a').attr('href')).toBe(href);
});

it.each([
  ['studio', 'https://prophotohub.com.ua/booking'],
  ['shop', 'https://prophotoshop.com.ua'],
] as const)('takes the %s promotional banner to the live destination', (destination, href) => {
  const $ = load(renderToStaticMarkup(createElement(StudioHomeBanner, { destination })));
  expect($('a')).toHaveLength(1);
  expect($('a').attr('href')).toBe(href);
});

it('keeps every room card and the studio overview on the live Hub domain', () => {
  const $ = load(
    renderToStaticMarkup(createElement(StudioHomeDirections, { mode: 'studio', directions: [] })),
  );
  expect($('a')).toHaveLength(4);
  for (const link of $('a').toArray()) {
    expect($(link).attr('href')).toBe('https://prophotohub.com.ua');
  }
});
