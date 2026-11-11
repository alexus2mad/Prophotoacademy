import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { resolvePurchase } from '../src/lib/checkout';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import { canTestEnroll } from '../src/lib/commerce/selectors';
import { canEnroll, programStatusLabel } from '../src/lib/format';
import { programSchedule } from '../src/lib/program-schedule';
import { programPresentation } from '../src/lib/programs/selectors';
import { studioProgramPage } from '../src/lib/studio-program/selectors';
import { ProgramPackages } from '../src/components/organisms/ProgramPackages/ProgramPackages';
import { PackageCard } from '../src/components/molecules/PackageCard/PackageCard';

const content = fixture as AcademyContent;
const courses = content.programs.filter((program) => program.category === 'course');
const courseIds = new Set(courses.map((program) => program.id));
const offerings = content.offerings.filter((offering) => courseIds.has(offering.programId));
const now = new Date('2026-11-11T10:00:00Z');

afterEach(() => vi.unstubAllEnvs());

describe('temporary course sales closure', () => {
  it('closes every configured course offering without altering its package identities or prices', () => {
    expect(offerings).toHaveLength(3);
    expect(offerings.every((offering) => offering.availability === 'closed')).toBe(true);
    expect(offerings.flatMap((offering) => offering.packages)).toHaveLength(9);
    expect(offerings.every((offering) => offering.packages.every((pack) => pack.price > 0))).toBe(
      true,
    );
  });

  it.each(['mock', 'disabled', 'wayforpay'])(
    'denies all course packages and catalog purchase links in %s mode',
    async (mode) => {
      vi.stubEnv('PAYMENT_MODE', mode);
      for (const offering of offerings) {
        expect((await enrollmentOptions(offering)).packageIds).toEqual([]);
        for (const pack of offering.packages) {
          expect(canEnroll(offering, pack, now)).toBe(false);
          expect(canTestEnroll(offering, pack)).toBe(false);
          expect(() => resolvePurchase(content, offering.id, pack.id, now)).toThrow(
            'Набір закрито',
          );
        }
      }
    },
  );

  it('also denies a closed package in an otherwise open offering', () => {
    const offering = { ...offerings[0], availability: 'open' as const };
    const pack = { ...offering.packages[0], availability: 'closed' as const };
    expect(canEnroll(offering, pack, now)).toBe(false);
    expect(canTestEnroll(offering, pack)).toBe(false);
  });

  it('keeps AI Artwork tickets buyable through the real payment mode', () => {
    vi.stubEnv('PAYMENT_MODE', 'wayforpay');
    const offering = content.offerings.find((item) => item.programId === 'program-ai-artwork')!;
    expect(offering.packages).toHaveLength(2);
    for (const pack of offering.packages) {
      expect(resolvePurchase(content, offering.id, pack.id, now).pack.kind).toBe('product');
      expect(canTestEnroll(offering, pack)).toBe(false);
    }
  });

  it('uses explicit closed copy across schedule, hero and packages even with stale enrollment props', () => {
    for (const offering of offerings) {
      const program = courses.find((item) => item.id === offering.programId)!;
      const enrollment = {
        mode: 'disabled' as const,
        packageIds: offering.packages.map((p) => p.id),
      };
      expect(programStatusLabel(program, offering)).toBe('Набір закрито');
      expect(programSchedule(program, offering, now)).toMatchObject({
        status: 'Набір закрито',
        inquirySuggested: true,
      });
      expect(programPresentation(program, offering, now)).toMatchObject({
        status: 'closed',
        open: false,
        buttonLabel: 'Наступний набір',
      });
      expect(studioProgramPage(program, content, enrollment).presentation.open).toBe(false);
      const $ = load(
        renderToStaticMarkup(createElement(ProgramPackages, { program, offering, enrollment })),
      );
      expect($('a[href^="/checkout?"]')).toHaveLength(0);
      expect($('.package-source-note')).toHaveLength(0);
      expect($.text()).toContain('Повідомити про наступний набір');
      expect($.text()).not.toContain('Уточнити умови навчання');
      expect($('.comparison-desktop').text()).toContain('Набір закрито');
      expect($('.package-grid article')).toHaveLength(3);
      expect(
        $('.package-grid button')
          .map((_, node) => $(node).text())
          .get(),
      ).toEqual(['Наступний набір', 'Наступний набір', 'Наступний набір']);
      const card = load(
        renderToStaticMarkup(
          createElement(PackageCard, {
            program,
            offering,
            pack: offering.packages[0],
            enrollable: true,
            paymentDisabled: true,
            availableLessons: ['Private lesson title'],
          }),
        ),
      );
      expect(card('a[href^="/checkout?"]')).toHaveLength(0);
      expect(card.text()).not.toContain('Private lesson title');
      expect(card.text()).not.toContain('Отримати доступ');
    }
  });
});
