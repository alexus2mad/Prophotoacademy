import type { Offering, Program } from './content/types';
import type { ProgramSchedule } from './program-schedule/types';
import { canEnroll, dateLabel } from './format';

export function kyivDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function programSchedule(
  program: Program,
  offering?: Offering,
  now = new Date(),
): ProgramSchedule {
  const date = offering?.startDate;
  const dated = date ? { value: dateLabel(date).replace(/\s*р\.$/u, ''), date } : undefined;

  if (offering?.availability === 'archived')
    return {
      label: 'Дата події',
      ...(dated || { value: 'Дату не зазначено' }),
      status: 'Подія завершена',
      explanation: 'Про наступну подію можна дізнатися в академії.',
      inquirySuggested: true,
    };

  if (program.category === 'individual' || program.category === 'corporate')
    return {
      label: 'Старт',
      value: 'За домовленістю',
      status: 'За вашим запитом',
      inquirySuggested: false,
    };

  if (offering?.learningState === 'recorded' || offering?.learningState === 'selfPaced')
    return {
      label: 'Доступ',
      value: 'За умовами обраного пакета',
      status:
        offering.learningState === 'recorded' ? 'Навчання в записі' : 'Навчання у власному темпі',
      explanation: 'Початок і тривалість доступу залежать від обраного пакета.',
      inquirySuggested: false,
    };

  const purchasable = Boolean(offering && canEnroll(offering, undefined, now));
  if (offering?.learningState === 'ongoing') {
    const joining = offering.joiningOpen === true && purchasable;
    return {
      label: dated ? 'Початок потоку' : 'Навчання',
      ...(dated || { value: 'Потік уже триває' }),
      status: 'Навчання триває',
      explanation: joining
        ? 'Долучення відкрите для доступних пакетів.'
        : offering.joiningOpen === false
          ? 'Долучення до цього потоку закрите. Наступний набір уточнюємо.'
          : 'Можливість долучення до цього потоку уточнюємо в академії.',
      inquirySuggested: !joining,
    };
  }

  const today = kyivDate(now);
  if (dated && dated.date >= today)
    return {
      label:
        offering?.verificationRequired !== false
          ? 'Дата потребує підтвердження'
          : date === today
            ? 'Старт сьогодні'
            : 'Старт навчання',
      ...dated,
      status: purchasable
        ? offering?.availability === 'limited'
          ? 'Місця обмежені'
          : 'Набір відкрито'
        : offering?.availability === 'soldOut'
          ? 'Місць немає'
          : 'Набір уточнюємо',
      inquirySuggested: !purchasable,
    };

  return {
    label: dated ? 'Попередня дата старту' : 'Наступний набір',
    ...(dated || { value: 'Дату уточнюємо' }),
    status: 'Наступний набір уточнюємо',
    explanation: purchasable
      ? 'Пакети доступні для придбання. Формат поточного навчання та дату наступного набору уточнить команда.'
      : 'Формат поточного навчання та дату наступного набору уточнить команда.',
    inquirySuggested: true,
  };
}
