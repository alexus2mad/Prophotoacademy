import type { Program, Offering } from '../content/types';
import type { ProgramGalleryContent, ProgramPresentation } from './types';
import { findImage } from '../content/selectors';
import { canEnroll, startingPrice } from '../format';
import { kyivDate } from '../program-schedule';

export function programHeroImages(program: Program, content: ProgramGalleryContent) {
  const hero = findImage(content, program.imageId);
  const workImages = program.workIds.flatMap((id) => {
    const work = content.works.find((item) => item.id === id);
    const image = work && content.images.find((item) => item.id === work.imageId);
    return image ? [image] : [];
  });
  const fallbackImages = [
    'editorial-strawberry',
    'editorial-underwater',
    'visual',
    'editorial-portrait',
  ].flatMap((id) => content.images.find((image) => image.id === id) || []);
  const seen = new Set<string>();
  return [hero, ...workImages, ...fallbackImages]
    .filter((image) => {
      if (seen.has(image.src)) return false;
      seen.add(image.src);
      return true;
    })
    .slice(0, 5);
}

export function programPresentation(
  program: Program,
  offering?: Offering,
  now = new Date(),
): ProgramPresentation {
  const price = startingPrice(offering);
  const open = Boolean(offering && canEnroll(offering, undefined, now));
  const isCustom = ['individual', 'corporate'].includes(program.category);
  const status =
    offering?.availability === 'archived'
      ? 'archived'
      : open && offering
        ? offering.availability
        : 'waitlist';
  const hasFutureStart = Boolean(offering?.startDate && offering.startDate >= kyivDate(now));
  const inquiryTitle = isCustom
    ? program.title
    : status === 'archived'
      ? 'Повідомити про наступну подію'
      : 'Дізнатися про найближчий набір';
  const buttonLabel = isCustom
    ? 'Обговорити програму'
    : status === 'archived'
      ? 'Наступна подія'
      : hasFutureStart
        ? 'Уточнити набір'
        : 'Дізнатися про набір';
  return { price, open, isCustom, status, inquiryTitle, buttonLabel, hasFutureStart };
}
