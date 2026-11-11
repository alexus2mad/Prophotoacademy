import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent, Offering } from '../src/lib/content/types';
import { OfferingSummary } from '../src/components/molecules/OfferingSummary/OfferingSummary';
import { StudioIntensiveTemplate } from '../src/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate';
import { programSchedule } from '../src/lib/program-schedule';
import { canEnroll } from '../src/lib/format';
import { offeringTimeLabel, validateOfferingTime } from '../src/lib/program-schedule/offering-time';

const content = fixture as AcademyContent;
const program = {
  ...content.programs[0],
  id: 'test-ai-artwork',
  slug: 'ai-artwork',
  category: 'class' as const,
};
const offering: Offering = {
  id: 'test-event',
  programId: program.id,
  startDate: '2026-11-22',
  startTime: '11:00',
  endTime: '16:00',
  timeZone: 'Europe/Kyiv',
  duration: '5 годин',
  format: 'hybrid',
  availability: 'open',
  verificationRequired: false,
  packages: [
    {
      id: 'test-online',
      name: 'Онлайн',
      kind: 'product',
      price: 3000,
      availability: 'open',
      description: 'Участь онлайн',
      includes: [],
    },
  ],
};

describe('authored event schedule', () => {
  it('keeps the local Kyiv time stable across winter and summer', () => {
    for (const startDate of ['2026-11-22', '2026-07-22']) {
      expect(offeringTimeLabel({ ...offering, startDate })).toBe('11:00–16:00 за Києвом');
    }
    expect(programSchedule(program, offering, new Date('2026-11-11T12:00:00Z'))).toMatchObject({
      label: 'Дата події',
      value: '22 листопада 2026',
      date: '2026-11-22',
      time: '11:00–16:00 за Києвом',
    });
  });

  it.each([
    { startDate: undefined },
    { startTime: undefined },
    { endTime: undefined },
    { timeZone: undefined },
    { startTime: '9:00' },
    { startTime: '24:00' },
    { endTime: '16:60' },
    { endTime: '11:00' },
    { endTime: '10:00' },
    { timeZone: 'Unknown/City' },
  ])('rejects an incomplete or invalid event range: %j', (invalid) => {
    const candidate = { ...offering, ...invalid };
    expect(validateOfferingTime(candidate)).not.toBe(true);
    expect(offeringTimeLabel(candidate)).toBeUndefined();
  });

  it('keeps courses without an event time optional and leaves their labels unchanged', () => {
    const undatedTime = {
      ...offering,
      startTime: undefined,
      endTime: undefined,
      timeZone: undefined,
    };
    expect(validateOfferingTime(undatedTime)).toBe(true);
    expect(offeringTimeLabel(undatedTime)).toBeUndefined();
    expect(offeringTimeLabel(undefined)).toBeUndefined();
    const course = { ...program, category: 'course' as const };
    expect(programSchedule(course, undatedTime, new Date('2026-11-11T12:00:00Z'))).toMatchObject({
      label: 'Старт навчання',
      status: 'Набір відкрито',
      value: '22 листопада 2026',
    });
  });

  it('does not label another timezone as Kyiv', () => {
    expect(offeringTimeLabel({ ...offering, timeZone: 'Europe/Warsaw' })).toBe(
      '11:00–16:00 (Europe/Warsaw)',
    );
  });

  it('renders the same semantic date and time in the hero, announcement and checkout', () => {
    const eventContent: AcademyContent = {
      ...content,
      programs: [program],
      offerings: [offering],
    };
    const $ = load(
      renderToStaticMarkup(createElement(StudioIntensiveTemplate, { content: eventContent })),
    );
    expect($('time[datetime="2026-11-22"]')).toHaveLength(2);
    expect(
      $('time')
        .map((_, node) => $(node).text())
        .get(),
    ).toEqual(['22 листопада 2026', '22 листопада 2026']);
    expect($.text().match(/11:00–16:00 за Києвом/g)).toHaveLength(2);
    const summary = load(
      renderToStaticMarkup(
        createElement(OfferingSummary, {
          program,
          offering,
          packageId: 'test-online',
          packageName: 'Онлайн',
        }),
      ),
    );
    expect(summary('time[datetime="2026-11-22"]').text()).toBe('22 листопада 2026');
    expect(summary.text()).toContain('11:00–16:00 за Києвом');
    expect(summary.text()).not.toContain('У Києві');
  });
});

describe('scheduled event sales window', () => {
  it.each([
    ['2026-11-22', '2026-11-21T14:00:00Z', true],
    ['2026-11-22', '2026-11-22T08:59:59Z', true],
    ['2026-11-22', '2026-11-22T09:00:00Z', true],
    ['2026-11-22', '2026-11-22T13:59:59Z', true],
    ['2026-11-22', '2026-11-22T14:00:00Z', false],
    ['2026-11-22', '2026-11-22T14:00:01Z', false],
    ['2026-11-22', '2026-11-23T08:00:00Z', false],
    ['2026-07-22', '2026-07-21T13:00:00Z', true],
    ['2026-07-22', '2026-07-22T07:59:59Z', true],
    ['2026-07-22', '2026-07-22T08:00:00Z', true],
    ['2026-07-22', '2026-07-22T12:59:59Z', true],
    ['2026-07-22', '2026-07-22T13:00:00Z', false],
    ['2026-07-22', '2026-07-22T13:00:01Z', false],
    ['2026-07-22', '2026-07-23T08:00:00Z', false],
  ])('gates the %s event at %s without openAfterStart bypass', (startDate, instant, expected) => {
    for (const openAfterStart of [false, true]) {
      const candidate = { ...offering, startDate, openAfterStart };
      const now = new Date(instant);
      expect(canEnroll(candidate, candidate.packages[0], now)).toBe(expected);
      expect(canEnroll(candidate, undefined, now)).toBe(expected);
    }
  });

  it('uses the event timezone even when the Kyiv calendar day has already changed', () => {
    const candidate = { ...offering, timeZone: 'America/Los_Angeles' };
    expect(canEnroll(candidate, candidate.packages[0], new Date('2026-11-22T23:59:59Z'))).toBe(
      true,
    );
    expect(canEnroll(candidate, candidate.packages[0], new Date('2026-11-23T00:00:00Z'))).toBe(
      false,
    );
  });

  it('preserves date-only sales when no valid event time is configured', () => {
    for (const time of [
      { startTime: undefined, endTime: undefined, timeZone: undefined },
      { endTime: undefined },
      { timeZone: 'Unknown/City' },
    ]) {
      for (const openAfterStart of [false, true]) {
        const candidate = { ...offering, ...time, openAfterStart };
        expect(canEnroll(candidate, candidate.packages[0], new Date('2026-11-22T15:00:00Z'))).toBe(
          true,
        );
        expect(canEnroll(candidate, candidate.packages[0], new Date('2026-11-23T08:00:00Z'))).toBe(
          openAfterStart,
        );
      }
    }
  });

  it('does not let a future event override closed or unverified package availability', () => {
    const now = new Date('2026-11-21T10:00:00Z');
    expect(canEnroll({ ...offering, verificationRequired: true }, offering.packages[0], now)).toBe(
      false,
    );
    expect(canEnroll({ ...offering, availability: 'archived' }, offering.packages[0], now)).toBe(
      false,
    );
    expect(canEnroll(offering, { ...offering.packages[0], availability: 'soldOut' }, now)).toBe(
      false,
    );
    expect(canEnroll(offering, { ...offering.packages[0], inquiryOnly: true }, now)).toBe(false);
  });
});
