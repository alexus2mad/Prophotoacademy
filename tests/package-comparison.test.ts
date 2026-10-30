import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent, Package } from '../src/lib/content/types';
import { packageComparisonFact } from '../src/lib/packages/selectors';
import { PackageComparisonTable } from '../src/components/molecules/PackageComparisonTable/PackageComparisonTable';

const content = fixture as AcademyContent;
const packages = content.offerings.flatMap((offering) => offering.packages);
const pack = (id: string) => packages.find((candidate) => candidate.id === id)!;

describe('evidence-backed package comparison', () => {
  it('does not turn legacy inclusion text or missing evidence into a benefit or exclusion', () => {
    const legacy: Package = {
      ...pack('visual-base'),
      comparison: undefined,
      includes: ['Чат і перевірка домашніх завдань'],
    };
    expect(packageComparisonFact(legacy, 'homework')).toEqual({
      state: 'unknown',
      label: 'Не уточнено',
      text: undefined,
    });
    expect(packageComparisonFact(pack('commercial-gold'), 'homework').state).toBe('unknown');
    expect(packageComparisonFact(pack('visual-gold'), 'support').state).toBe('unknown');
  });

  it('distinguishes explicit exclusions from missing evidence and retains the renamed GOLD facts', () => {
    expect(packageComparisonFact(pack('instagram-base'), 'homework').state).toBe('excluded');
    expect(packageComparisonFact(pack('instagram-base'), 'support').state).toBe('excluded');
    expect(pack('instagram-expert').name).toBe('GOLD');
    expect(packageComparisonFact(pack('instagram-expert'), 'homework').state).toBe('included');
    expect(packageComparisonFact(pack('commercial-platinum'), 'homework').state).toBe('included');
  });

  it('does not inherit benefits or access duration for the new Instagram PLATINUM', () => {
    const unconfirmed = pack('instagram-platinum');
    expect(unconfirmed.includes).toEqual([]);
    expect(Object.values(unconfirmed.comparison!).every((fact) => fact.state === 'unknown')).toBe(
      true,
    );
    expect(unconfirmed.availability).toBe('open');
    expect(unconfirmed.inquiryOnly).not.toBe(true);
  });

  it('renders the same evidence rows while preserving package purchase context', () => {
    const items = [pack('instagram-base'), pack('instagram-expert'), pack('instagram-platinum')];
    const $ = load(
      renderToStaticMarkup(
        createElement(PackageComparisonTable, {
          items: items.map((item) => ({
            ...item,
            statusLabel: 'Доступний',
            inquiryAllowed: true,
            purchaseUrl: `/checkout?offering=offering-instagram-2026-10&package=${item.id}`,
          })),
          programTitle: 'Інста, яка продає',
          onClose: () => {},
          onInquire: () => {},
        }),
      ),
    );
    const homework = $('tr').filter(
      (_, element) => $(element).find('th[scope="row"]').text() === 'Перевірка домашніх завдань',
    );
    expect(
      homework
        .find('td')
        .map((_, element) => $(element).attr('data-state'))
        .get(),
    ).toEqual(['excluded', 'included', 'unknown']);
    expect(homework.find('td').eq(0).text()).toContain('Не входить');
    expect(homework.find('td').eq(2).text()).toBe('Не уточнено');
    expect($('td[data-state="unknown"]').length).toBeGreaterThanOrEqual(6);
    items.forEach((item) => {
      expect($(`a[href$="package=${item.id}"]`).length).toBe(1);
    });
  });
});
