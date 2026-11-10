import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { PackageCard } from '../src/components/molecules/PackageCard/PackageCard';
import type { PackageCardLayout } from '../src/components/molecules/PackageCard/types';

const content = fixture as AcademyContent;
const program = content.programs.find((item) => item.id === 'program-visual')!;
const offering = content.offerings.find((item) => item.programId === program.id)!;
const pack = offering.packages[0];

describe('Studio package presentation preserves purchasing boundaries', () => {
  it.each<PackageCardLayout>(['summary-first', 'benefits-first'])(
    '%s renders one eligible checkout action with identical package context',
    (layout) => {
      const $ = load(
        renderToStaticMarkup(
          createElement(PackageCard, {
            program,
            offering,
            pack,
            layout,
            enrollable: true,
          }),
        ),
      );
      const action = $('.package-action a');
      expect(action).toHaveLength(1);
      expect(action.attr('href')).toBe(`/checkout?offering=${offering.id}&package=${pack.id}`);
      expect($('.package-action button')).toHaveLength(0);
      const children = $('.package-card').children().toArray();
      const benefitsIndex = children.indexOf($('.package-includes-desktop')[0]);
      const priceIndex = children.indexOf($('.price')[0]);
      expect(benefitsIndex < priceIndex).toBe(layout === 'benefits-first');
    },
  );

  it.each(['inquiry-only', 'unavailable', 'sold-out'])(
    'benefits-first cannot enable checkout for %s',
    (state) => {
      const $ = load(
        renderToStaticMarkup(
          createElement(PackageCard, {
            program,
            offering,
            layout: 'benefits-first',
            pack: {
              ...pack,
              inquiryOnly: state === 'inquiry-only',
              availability: state === 'sold-out' ? 'soldOut' : 'open',
            },
            enrollable: state === 'inquiry-only',
          }),
        ),
      );
      expect($('a[href^="/checkout"]')).toHaveLength(0);
      expect($('.package-action button')).toHaveLength(state === 'sold-out' ? 0 : 1);
      if (state === 'sold-out') expect($('.package-status').text()).toBe('Місць немає');
    },
  );

  it('retains the explicit test-access action and its lesson scope without duplicating controls', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(PackageCard, {
          program,
          offering,
          pack,
          layout: 'benefits-first',
          enrollable: true,
          paymentDisabled: true,
          availableLessons: ['Лекція 2 — Композиція'],
        }),
      ),
    );
    expect($('.package-action a')).toHaveLength(1);
    expect($('.package-action a').text()).toBe('Отримати доступ');
    expect($('.enrollment-scope li').text()).toBe('Лекція 2 — Композиція');
    expect($('.enrollment-scope').text()).toContain('лише до перелічених уроків');
  });
});
