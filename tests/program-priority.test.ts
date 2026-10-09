import { describe, it, expect } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { primaryProgram, prioritizePrograms } from '../src/lib/program-priority';

const content = fixture as AcademyContent;

describe('editorial course priority', () => {
  it('selects the configured primary course and leads the catalog without duplicating it', () => {
    expect(primaryProgram(content)?.slug).toBe('course-smm-instagram');
    const ordered = prioritizePrograms(content.programs, content.settings.primaryProgramId);
    expect(ordered[0].id).toBe('program-instagram');
    expect(ordered.map((program) => program.id)).toHaveLength(content.programs.length);
    expect(new Set(ordered.map((program) => program.id)).size).toBe(content.programs.length);
    expect(ordered.slice(1)).toEqual(
      content.programs.filter((program) => program.id !== 'program-instagram'),
    );
    expect(content.programs[0].id).not.toBe('program-instagram');
  });

  it('follows a different course selected by the editor', () => {
    const changed = {
      ...content,
      settings: { ...content.settings, primaryProgramId: 'program-visual' },
    };
    expect(primaryProgram(changed)?.id).toBe('program-visual');
    expect(prioritizePrograms(changed.programs, changed.settings.primaryProgramId)[0].id).toBe(
      'program-visual',
    );
  });

  it.each([undefined, 'missing-program', 'program-individual'])(
    'keeps the general opening and editorial order for an invalid or cleared selection (%s)',
    (id) => {
      const changed = { ...content, settings: { ...content.settings, primaryProgramId: id } };
      expect(primaryProgram(changed)).toBeUndefined();
      expect(prioritizePrograms(changed.programs, id)).toEqual(content.programs);
    },
  );
});
