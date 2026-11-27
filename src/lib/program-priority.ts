import type { AcademyContent, Program } from './content/types';
import { listedPrograms } from './content/selectors';

export function primaryProgram(content: AcademyContent) {
  return listedPrograms(content.programs).find(
    (program) => program.id === content.settings.primaryProgramId && program.category === 'course',
  );
}

// Move the selected course to the front without changing editorial order elsewhere.
export function prioritizePrograms(programs: Program[], primaryProgramId?: string) {
  const listed = listedPrograms(programs);
  const selected = listed.find(
    (program) => program.id === primaryProgramId && program.category === 'course',
  );
  return selected ? [selected, ...listed.filter((program) => program.id !== selected.id)] : listed;
}
