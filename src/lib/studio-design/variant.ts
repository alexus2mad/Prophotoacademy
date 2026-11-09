import type { AcademyDesign } from './types';

export function academyDesign(): AcademyDesign {
  const design = process.env.NEXT_PUBLIC_ACADEMY_DESIGN ?? 'legacy';
  if (design === 'legacy' || design === 'studio') return design;
  throw new Error(`Invalid NEXT_PUBLIC_ACADEMY_DESIGN: ${design}`);
}
