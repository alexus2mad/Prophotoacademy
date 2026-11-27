import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent, Program } from '../src/lib/content/types';
import { programPresentation } from '../src/lib/programs/selectors';
import { programSchedule } from '../src/lib/program-schedule';
import { studioAcademyCourses, studioProgramImage } from '../src/lib/studio-pages/selectors';
import { studioProgramArtwork } from '../src/lib/studio-program/selectors';

const content = fixture as AcademyContent;

describe('Academy main courses', () => {
  it('uses the approved order without hiding additional CMS courses or mutating the input', () => {
    const additionalCourse: Program = { ...content.programs[0], id: 'cms-additional-course' };
    const programs = [additionalCourse, ...content.programs].reverse();
    const originalIds = programs.map((program) => program.id);

    expect(studioAcademyCourses(programs).map((program) => program.id)).toEqual([
      'program-food',
      'program-commercial',
      'program-visual',
      'program-instagram',
      'cms-additional-course',
    ]);
    expect(programs.map((program) => program.id)).toEqual(originalIds);
  });

  it('presents the food course at its own URL with its open offering and course photograph', () => {
    const program = content.programs.find((item) => item.slug === 'food-product-photography')!;
    const offering = content.offerings.find((item) => item.programId === program.id);
    const presentation = programPresentation(program, offering);
    const image = studioProgramImage(program, content.images);

    expect(program.id).toBe('program-food');
    expect(presentation).toMatchObject({ open: true, price: 7900 });
    expect(programSchedule(program, offering)).toMatchObject({ date: '2026-12-17' });
    expect(image).toEqual(content.images.find((item) => item.id === 'food-chocolate-pattern'));
    expect(studioProgramArtwork(program, content).asset).toEqual(image);
    expect(content.programs.find((item) => item.id === 'program-commercial')?.slug).toBe(
      'content-creator',
    );
  });
});
