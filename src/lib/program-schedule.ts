import type { Offering, Program } from './content/types';
import { dateLabel } from './format';

export function programSchedule(program: Program, offering?: Offering, now = new Date()) {
  if (program.category === 'individual' || program.category === 'corporate')
    return { label: 'Старт', value: 'За домовленістю' };
  if (!offering?.startDate) return { label: 'Старт', value: 'Дату уточнюємо' };

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return {
    label:
      offering.availability === 'archived'
        ? 'Дата події'
        : offering.startDate < today
          ? 'Потік стартував'
          : offering.startDate === today
            ? 'Старт сьогодні'
            : 'Старт навчання',
    value: dateLabel(offering.startDate).replace(/\s*р\.$/u, ''),
    date: offering.startDate,
  };
}
