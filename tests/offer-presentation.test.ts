import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { programSchedule } from '../src/lib/program-schedule';
import { programPresentation } from '../src/lib/programs/selectors';
import { CourseCard } from '../src/components/molecules/CourseCard/CourseCard';
import { OfferingSummary } from '../src/components/molecules/OfferingSummary/OfferingSummary';
import { ProgramHero } from '../src/components/organisms/ProgramHero/ProgramHero';
import { ProgramPackages } from '../src/components/organisms/ProgramPackages/ProgramPackages';

const content = fixture as AcademyContent;
const enableTimers = vi.useFakeTimers.bind(vi);
const restoreTimers = vi.useRealTimers.bind(vi);
beforeEach(() => {
  enableTimers();
  vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));
});
afterEach(() => restoreTimers());

describe('one schedule across buyer decision surfaces', () => {
  it.each(['program-visual', 'program-commercial', 'program-instagram', 'program-lab'])(
    'keeps the same date and availability meaning for %s',
    (id) => {
      const program = content.programs.find((item) => item.id === id)!;
      const offering = content.offerings.find((item) => item.programId === id)!;
      const image = content.images.find((item) => item.id === program.imageId)!;
      const schedule = programSchedule(program, offering);
      const surfaces = [
        createElement(CourseCard, { program, offering, image }),
        createElement(ProgramHero, {
          program,
          offering,
          images: [image],
          presentation: programPresentation(program, offering),
        }),
        createElement(ProgramPackages, { program, offering }),
        createElement(OfferingSummary, {
          program,
          offering,
          packageId: offering.packages[0]?.id,
          packageName: offering.packages[0]?.name,
        }),
      ];
      for (const surface of surfaces) {
        const $ = load(renderToStaticMarkup(surface));
        expect($.text()).toContain(schedule.status);
        expect($.text()).toContain(schedule.value);
        expect($.text()).not.toContain('Найближчий старт');
        if (schedule.date) expect($(`time[datetime="${schedule.date}"]`).length).toBe(1);
      }
    },
  );

  it('offers clarification without removing authorized purchasing for an unresolved intake', () => {
    const program = content.programs.find((item) => item.id === 'program-instagram')!;
    const offering = content.offerings.find((item) => item.programId === program.id)!;
    const $ = load(renderToStaticMarkup(createElement(ProgramPackages, { program, offering })));
    expect($('.package-card a[href^="/checkout?"]').length).toBe(3);
    expect($('button[aria-controls="inquiry-dialog"]').text()).toContain('Уточнити умови навчання');
    expect($.text()).toContain('Наступний набір уточнюємо');
    expect($.text()).not.toContain('Набір відкрито');
  });
});
