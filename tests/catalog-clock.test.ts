import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { CatalogResults } from '../src/components/organisms/CatalogResults/CatalogResults';
import { ProgramCatalog } from '../src/components/organisms/ProgramCatalog/ProgramCatalog';
import { programPresentation } from '../src/lib/programs/selectors';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));

const enableTimers = vi.useFakeTimers.bind(vi);
const restoreTimers = vi.useRealTimers.bind(vi);
const content = fixture as AcademyContent;
const program = content.programs.find((item) => item.id === 'program-commercial')!;
const offering = content.offerings.find((item) => item.programId === program.id)!;
const beforeMidnight = '2026-11-06T21:59:59Z';
const afterMidnight = '2026-11-06T22:00:01Z';
const props = { content, programs: [program], asOf: beforeMidnight };

afterEach(() => restoreTimers());

describe('catalog date snapshot', () => {
  it('keeps streamed fallback and initial client rendering identical across Kyiv midnight', () => {
    enableTimers();
    vi.setSystemTime(beforeMidnight);
    const serverMarkup = renderToStaticMarkup(
      createElement(CatalogResults, { ...props, category: 'all' }),
    );
    expect(load(serverMarkup)('.course-schedule').text()).toContain('Старт сьогодні');

    vi.setSystemTime(afterMidnight);
    const initialClientMarkup = renderToStaticMarkup(createElement(ProgramCatalog, props));
    expect(initialClientMarkup).toBe(serverMarkup);

    const refreshedMarkup = renderToStaticMarkup(
      createElement(CatalogResults, { ...props, category: 'all', asOf: afterMidnight }),
    );
    expect(load(refreshedMarkup)('.course-schedule').text()).toContain('Попередня дата старту');
  });

  it('uses the supplied time for both program eligibility and date presentation', () => {
    enableTimers();
    vi.setSystemTime('2027-01-01T10:00:00Z');
    const datedOffering = { ...offering, openAfterStart: false };
    expect(programPresentation(program, datedOffering, new Date(beforeMidnight))).toMatchObject({
      open: true,
      status: 'open',
      hasFutureStart: true,
    });
    expect(programPresentation(program, datedOffering, new Date(afterMidnight))).toMatchObject({
      open: false,
      status: 'waitlist',
      hasFutureStart: false,
    });
  });
});
