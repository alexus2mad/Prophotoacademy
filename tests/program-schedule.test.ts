import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent, Offering } from '../src/lib/content/types';
import { canTestEnroll } from '../src/lib/commerce/selectors';
import { canEnroll } from '../src/lib/format';
import { programSchedule } from '../src/lib/program-schedule';

const content = fixture as AcademyContent;
const commercial = content.programs.find((program) => program.id === 'program-commercial')!;
const offering = content.offerings.find((item) => item.programId === commercial.id)!;
const now = new Date('2026-10-28T10:00:00Z');

describe('shared offering schedule presentation', () => {
  it('shows the confirmed future intake date without changing it', () => {
    const schedule = programSchedule(commercial, offering, now);
    expect(schedule).toMatchObject({
      label: 'Старт навчання',
      date: '2026-11-06',
      status: 'Набір відкрито',
      inquirySuggested: false,
    });
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

  it('treats a start as historical after Kyiv midnight, before UTC midnight', () => {
    const schedule = programSchedule(
      commercial,
      { ...offering, startDate: '2026-07-14' },
      new Date('2026-07-14T21:30:00Z'),
    );
    expect(schedule).toMatchObject({
      label: 'Попередня дата старту',
      date: '2026-07-14',
      status: 'Наступний набір уточнюємо',
    });
  });

  it('qualifies an unverified future date without advertising open enrollment', () => {
    expect(
      programSchedule(commercial, { ...offering, verificationRequired: true }, now),
    ).toMatchObject({
      label: 'Дата потребує підтвердження',
      status: 'Набір уточнюємо',
      inquirySuggested: true,
    });
  });

  it('does not infer recorded or ongoing learning from permission to sell after a past start', () => {
    const current = content.offerings.find((item) => item.programId === 'program-instagram')!;
    expect(current.openAfterStart).toBe(true);
    expect(canEnroll(current, current.packages[0], now)).toBe(true);
    const schedule = programSchedule(commercial, current, now);
    expect(schedule).toMatchObject({
      label: 'Попередня дата старту',
      date: '2026-10-02',
      status: 'Наступний набір уточнюємо',
      inquirySuggested: true,
    });
    expect(schedule.value).toContain('2 жовтня 2026');
    expect(schedule.explanation).toContain('Пакети доступні для придбання');
  });

  it.each(['recorded', 'selfPaced'] as const)(
    'uses package access information for explicitly %s learning, not an old cohort date',
    (learningState) => {
      const schedule = programSchedule(
        commercial,
        { ...offering, learningState, startDate: '2026-03-13' },
        now,
      );
      expect(schedule).toMatchObject({
        label: 'Доступ',
        value: 'За умовами обраного пакета',
        status: learningState === 'recorded' ? 'Навчання в записі' : 'Навчання у власному темпі',
      });
      expect(schedule.date).toBeUndefined();
      expect(schedule.explanation).not.toMatch(/одразу|негайно/);
    },
  );

  it('describes joining an ongoing cohort only when both joining and purchase are supported', () => {
    const ongoing: Offering = {
      ...offering,
      startDate: '2026-10-01',
      learningState: 'ongoing',
      joiningOpen: true,
      openAfterStart: true,
    };
    expect(programSchedule(commercial, ongoing, now)).toMatchObject({
      label: 'Початок потоку',
      status: 'Навчання триває',
      explanation: 'Долучення відкрите для доступних пакетів.',
      inquirySuggested: false,
    });
    for (const closed of [
      { ...ongoing, joiningOpen: undefined },
      { ...ongoing, joiningOpen: false },
      { ...ongoing, verificationRequired: true },
      { ...ongoing, openAfterStart: false },
      { ...ongoing, availability: 'soldOut' as const },
    ]) {
      const schedule = programSchedule(commercial, closed, now);
      expect(schedule.status).toBe('Навчання триває');
      expect(schedule.inquirySuggested).toBe(true);
      expect(schedule.explanation).not.toContain('Долучення відкрите');
    }
  });

  it('keeps archived precedence even when other learning metadata or the date conflict', () => {
    const archived: Offering = {
      ...offering,
      startDate: '2026-11-06',
      availability: 'archived',
      learningState: 'recorded',
    };
    expect(programSchedule(commercial, archived, now)).toMatchObject({
      label: 'Дата події',
      date: '2026-11-06',
      status: 'Подія завершена',
      inquirySuggested: true,
    });
    expect(programSchedule(commercial, { ...archived, startDate: undefined }, now)).toMatchObject({
      label: 'Дата події',
      value: 'Дату не зазначено',
      status: 'Подія завершена',
    });
  });

  it('retains the actual date of the archived event', () => {
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
      expect(programSchedule(program, offering, now)).toMatchObject({
        label: 'Старт',
        value: 'За домовленістю',
        status: 'За вашим запитом',
      });
    },
  );

  it('does not invent a cohort date or learning mode when the offering or date is missing', () => {
    for (const unknown of [undefined, { ...offering, startDate: undefined }]) {
      expect(programSchedule(commercial, unknown, now)).toMatchObject({
        label: 'Наступний набір',
        value: 'Дату уточнюємо',
        status: 'Наступний набір уточнюємо',
        inquirySuggested: true,
      });
    }
  });

  it('does not let presentation metadata change paid or test enrollment eligibility', () => {
    const past: Offering = { ...offering, startDate: '2026-03-13', openAfterStart: false };
    for (const learningState of [undefined, 'recorded', 'selfPaced', 'ongoing'] as const) {
      for (const openAfterStart of [false, true]) {
        const candidate = { ...past, learningState, joiningOpen: true, openAfterStart };
        const before = structuredClone(candidate);
        programSchedule(commercial, candidate, now);
        expect(candidate).toEqual(before);
        expect(canEnroll(candidate, candidate.packages[0], now)).toBe(openAfterStart);
        expect(canTestEnroll(candidate, candidate.packages[0])).toBe(true);
      }
    }
  });
});
