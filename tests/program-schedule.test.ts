import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { programSchedule } from '../src/lib/program-schedule';

const content = fixture as AcademyContent;
const commercial = content.programs.find((program) => program.id === 'program-commercial')!;
const offering = content.offerings.find((item) => item.programId === commercial.id)!;
const now = new Date('2026-10-28T10:00:00Z');

describe('catalog start dates', () => {
  it('shows the authored future intake date and year without changing it', () => {
    const schedule = programSchedule(commercial, offering, now);
    expect(schedule.label).toBe('Старт навчання');
    expect(schedule.date).toBe('2026-11-06');
    expect(schedule.value).toContain('6 листопада 2026');
  });

  it.each([
    ['2026-01-15', '2026-01-14T22:30:00Z'],
    ['2026-07-15', '2026-07-14T21:30:00Z'],
  ])('uses the Kyiv calendar day in winter and summer (%s)', (startDate, utcTime) => {
    const schedule = programSchedule(commercial, { ...offering, startDate }, new Date(utcTime));
    expect(schedule.label).toBe('Старт сьогодні');
    expect(schedule.date).toBe(startDate);
  });

  it('does not present an open past intake as a new upcoming course', () => {
    const visual = content.programs.find((program) => program.id === 'program-visual')!;
    const current = content.offerings.find((item) => item.programId === visual.id)!;
    expect(current.openAfterStart).toBe(true);
    const schedule = programSchedule(visual, current, now);
    expect(schedule.label).toBe('Потік стартував');
    expect(schedule.date).toBe('2026-03-13');
    expect(schedule.value).toContain('13 березня 2026');
  });

  it('retains the actual date for an archived event without advertising a start', () => {
    const event = content.programs.find((program) => program.id === 'program-lab')!;
    const archived = content.offerings.find((item) => item.programId === event.id)!;
    const schedule = programSchedule(event, archived, now);
    expect(schedule.label).toBe('Дата події');
    expect(schedule.date).toBe('2026-09-26');
    expect(schedule.value).toContain('26 вересня 2026');
  });

  it.each(['program-individual', 'program-corporate'])(
    'keeps bespoke training scheduled by agreement (%s)',
    (id) => {
      const program = content.programs.find((item) => item.id === id)!;
      expect(programSchedule(program, offering, now)).toEqual({
        label: 'Старт',
        value: 'За домовленістю',
      });
    },
  );

  it('does not invent a date when the offering or its start date is missing', () => {
    for (const unknown of [undefined, { ...offering, startDate: undefined }]) {
      expect(programSchedule(commercial, unknown, now)).toEqual({
        label: 'Старт',
        value: 'Дату уточнюємо',
      });
    }
  });
});
