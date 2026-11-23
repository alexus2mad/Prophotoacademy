import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '@/lib/content/types';
import { buildSiteSeeds } from '@/lib/site-editor/seed-model';
import { programPresentationContent } from '@/lib/site-editor/program';

const content = fixture as AcademyContent;
const food = content.programs.find((program) => program.id === 'program-food')!;

describe('Food course responsive introduction', () => {
  it('lets editors change the mobile introduction independently of desktop copy', () => {
    const page = buildSiteSeeds(content).find((seed) => seed.path === '/' + food.slug)!;
    const fields = page.sections.find((section) => section.id === 'introduction')!.fields;
    const desktop = fields.find((field) => field.id === 'description')!;
    const mobile = fields.find((field) => field.id === 'mobile-description')!;
    expect(desktop.value).toContain('штучним інтелектом');
    expect(mobile.value).toBe(
      'Єдиний найбільш повний курс наживо онлайн+офлайн з виходом на комерцію',
    );
    mobile.value = 'Предметна зйомка для вашого бренду';
    expect(programPresentationContent(content, food, page).editorial?.intro).toMatchObject({
      description: desktop.value,
      mobileDescription: mobile.value,
      heading: { hand: '*як ви це робите' },
    });
  });

  it('supplies the mobile version to an older publication while preserving its edited desktop copy', () => {
    const page = buildSiteSeeds(content).find((seed) => seed.path === '/' + food.slug)!;
    const intro = page.sections.find((section) => section.id === 'introduction')!;
    intro.fields = intro.fields.filter((field) => field.id !== 'mobile-description');
    intro.fields.find((field) => field.id === 'description')!.value = 'Авторський текст';
    const result = programPresentationContent(content, food, page).editorial?.intro;
    expect(result?.description).toBe('Авторський текст');
    expect(result?.mobileDescription).toContain('онлайн+офлайн');
    const commercial = content.programs.find((program) => program.id === 'program-commercial')!;
    expect(
      programPresentationContent(content, commercial).editorial?.intro.mobileDescription,
    ).toBeUndefined();
  });
});
