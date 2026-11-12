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

vi.mock('next/navigation', () => ({ usePathname: () => '/academy' }));

const content = fixture as AcademyContent;

it('takes header, menu and footer visitors to the Studio website and Shop Instagram', () => {
  for (const component of [StudioHeader, StudioFooter]) {
    const $ = load(renderToStaticMarkup(createElement(component, { settings: content.settings })));
    expect($('a[href="https://prophotohub.com.ua"]').length).toBeGreaterThan(0);
    expect(
      $('a[href="https://www.instagram.com/prophoto.shop?mdxt=ZnIwcnUzdHp2eGh2"]').length,
    ).toBeGreaterThan(0);
    expect($('a[href^="/photo-studio"], a[href^="/shop"]')).toHaveLength(0);
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

it('keeps the Academy hero action and links directly to the other brands', () => {
  const $ = load(renderToStaticMarkup(createElement(StudioHomeHero)));
  expect($('a.studio-button').attr('href')).toBe('/academy');
  expect($('nav a[data-brand="studio"]').attr('href')).toBe('https://prophotohub.com.ua');
  expect($('nav a[data-brand="shop"]').attr('href')).toBe(
    'https://www.instagram.com/prophoto.shop?mdxt=ZnIwcnUzdHp2eGh2',
  );
});

it.each([
  ['studio', 'https://prophotohub.com.ua/booking'],
  ['shop', 'https://www.instagram.com/prophoto.shop?mdxt=ZnIwcnUzdHp2eGh2'],
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
