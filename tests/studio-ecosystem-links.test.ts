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
import { Footer } from '../src/components/organisms/Footer/Footer';
import { StudioSpacesTemplate } from '../src/components/templates/StudioSpacesTemplate/StudioSpacesTemplate';
import { StudioShopTemplate } from '../src/components/templates/StudioShopTemplate/StudioShopTemplate';

vi.mock('next/navigation', () => ({ usePathname: () => '/academy' }));

const content = fixture as AcademyContent;

it('opens the Studio and Shop introductions from header, menu and footer navigation', () => {
  for (const component of [StudioHeader, StudioFooter]) {
    const $ = load(renderToStaticMarkup(createElement(component, { settings: content.settings })));
    expect($('a[href="/photo-studio"]').length).toBeGreaterThan(0);
    expect($('a[href="/shop"]').length).toBeGreaterThan(0);
    expect($('a[href^="https://prophotohub.com.ua"]')).toHaveLength(0);
    expect($('a[href="/academy"]').length).toBeGreaterThan(0);
  }
  const legacy = load(renderToStaticMarkup(createElement(Footer, { settings: content.settings })));
  expect(
    legacy('a[href="https://www.instagram.com/prophoto.shop?mdxt=ZnIwcnUzdHp2eGh2"]').length,
  ).toBe(1);
});

it('links public footer visitors to Academy information and legal pages', () => {
  const $ = load(renderToStaticMarkup(createElement(StudioFooter, { settings: content.settings })));
  expect($('footer a[href="/about-us"]').text()).toBe('Про академію');
  const legal = $('footer nav[aria-label="Правова інформація"]');
  expect(
    legal
      .find('a')
      .map((_, link) => $(link).attr('href'))
      .get(),
  ).toEqual(['/terms-of-service', '/privacy-policy']);
});

it.each([
  ['academy', '/academy'],
  ['studio', 'https://prophotohub.com.ua/booking'],
  ['shop', 'https://www.instagram.com/prophoto.shop?mdxt=ZnIwcnUzdHp2eGh2'],
] as const)('switches the %s hero action while keeping brand selectors as tabs', (mode, href) => {
  const $ = load(
    renderToStaticMarkup(createElement(StudioHomeHero, { mode, onModeChange: vi.fn() })),
  );
  expect($('a.studio-button').attr('href')).toBe(href);
  expect($('[role="tab"]')).toHaveLength(3);
  expect($('[role="tab"][aria-selected="true"]').attr('data-brand')).toBe(mode);
  expect($('[role="tab"][tabindex="0"]').attr('data-brand')).toBe(mode);
  expect($('a[data-brand]')).toHaveLength(0);
});

it.each([
  ['studio', 'https://prophotohub.com.ua/booking'],
  ['shop', 'https://www.instagram.com/prophoto.shop?mdxt=ZnIwcnUzdHp2eGh2'],
] as const)('takes the %s promotional banner to the live destination', (destination, href) => {
  const $ = load(renderToStaticMarkup(createElement(StudioHomeBanner, { destination })));
  expect($('a')).toHaveLength(1);
  expect($('a').attr('href')).toBe(href);
});

it('opens each room at its Studio section and the overview at the page top', () => {
  const $ = load(
    renderToStaticMarkup(createElement(StudioHomeDirections, { mode: 'studio', directions: [] })),
  );
  expect($('a')).toHaveLength(4);
  expect(
    $('a')
      .map((_, link) => $(link).attr('href'))
      .get(),
  ).toEqual([
    '/photo-studio',
    '/photo-studio#cyclorama',
    '/photo-studio#content-room',
    '/photo-studio#makeup',
  ]);
});

it('reserves Studio rooms on the public Hub booking page, not its embed', () => {
  const $ = load(renderToStaticMarkup(createElement(StudioSpacesTemplate, { content })));
  const actions = $('a.studio-button');
  expect(actions).toHaveLength(6);
  for (const action of actions.toArray()) {
    expect($(action).attr('href')).toBe('https://prophotohub.com.ua/booking');
  }
  expect($('a[href*="booking.plainstack.net"]')).toHaveLength(0);
  expect($('a[href="#spaces"]')).toHaveLength(1);
});

it('takes Shop page CTAs to the configured Instagram destination', () => {
  const $ = load(renderToStaticMarkup(createElement(StudioShopTemplate)));
  const links = $('a').filter((_, link) => $(link).attr('href') !== '/privacy-policy');
  expect(links).toHaveLength(3);
  for (const link of links.toArray()) {
    expect($(link).attr('href')).toBe(
      'https://www.instagram.com/prophoto.shop?mdxt=ZnIwcnUzdHp2eGh2',
    );
  }
  expect($('#equipment-selection')).toHaveLength(1);
});
