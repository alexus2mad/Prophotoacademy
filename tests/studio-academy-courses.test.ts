import { describe, expect, it } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent, Program } from '../src/lib/content/types';
import { programPresentation } from '../src/lib/programs/selectors';
import { programSchedule } from '../src/lib/program-schedule';
import { studioAcademyCourses, studioProgramImage } from '../src/lib/studio-pages/selectors';
import { studioProgramArtwork } from '../src/lib/studio-program/selectors';
import { studioAssets } from '../src/lib/studio-design/assets';

const content = fixture as AcademyContent;

describe('Academy main courses', () => {
  it('uses the approved order without hiding additional CMS courses or mutating the input', () => {
    const additionalCourse: Program = { ...content.programs[0], id: 'cms-additional-course' };
    const programs = [additionalCourse, ...content.programs].reverse();
    const originalIds = programs.map((program) => program.id);

    expect(studioAcademyCourses(programs).map((program) => program.id)).toEqual([
      'program-commercial',
      'program-visual',
      'program-instagram',
      'program-food',
      'cms-additional-course',
    ]);
    expect(programs.map((program) => program.id)).toEqual(originalIds);
  });

  it('keeps the distinct food course inquiry-only until an offering is authored', () => {
    const program = content.programs.find((item) => item.slug === 'food-photography')!;
    const offering = content.offerings.find((item) => item.programId === program.id);
    const presentation = programPresentation(program, offering);
    const image = studioProgramImage(program, content.images);

    expect(program.id).not.toBe('program-commercial');
    expect(offering).toBeUndefined();
    expect(presentation).toMatchObject({ open: false, price: undefined });
    expect(programSchedule(program, offering)).toMatchObject({
      value: 'Дату уточнюємо',
      inquirySuggested: true,
    });
    expect(image).toBeDefined();
    expect(image).toEqual(studioAssets.academy.imgImgContent2);
    expect(studioProgramArtwork(program, content).asset).toEqual(image);
    expect(content.programs.find((item) => item.id === 'program-commercial')?.slug).toBe(
      'food-product-photography',
    );
  });
});
