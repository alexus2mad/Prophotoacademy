import type { Program, Offering } from '../content/types';
import type { ProgramPresentation } from './types';
import { canEnroll, offeringStatus, startingPrice } from '../format';
export function programPresentation(
  program: Program,
  offering?: Offering,
  now = new Date(),
): ProgramPresentation {
  const price = startingPrice(offering);
  const open = Boolean(offering && canEnroll(offering));
  const isCustom = ['individual', 'corporate'].includes(program.category);
  const status = offering ? offeringStatus(offering) : 'waitlist';
  const hasFutureStart = Boolean(
    offering?.startDate && offering.startDate >= now.toISOString().slice(0, 10),
  );
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
