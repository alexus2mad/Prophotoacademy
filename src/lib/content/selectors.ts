import type { AcademyContent, Program } from './types';
// Programs shown on the public site; archived ones stay in content for students and admin.
export function listedPrograms<T extends Pick<Program, 'archived'>>(programs: T[]) {
  return programs.filter((program) => !program.archived);
}
export function findImage(content: Pick<AcademyContent, 'images'>, id: string) {
  const image = content.images.find((i) => i.id === id);
  if (!image) throw new Error(`Missing image ${id}`);
  return image;
}
export function findOffering(content: Pick<AcademyContent, 'offerings'>, programId: string) {
  return content.offerings
    .filter((o) => o.programId === programId)
    .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))[0];
}
