import type { AcademyContent } from './types';
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
