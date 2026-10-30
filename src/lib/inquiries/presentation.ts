import type { InquiryContext, InquiryCopy, InquirySubject } from './types';

const subjects: Record<InquirySubject, InquiryCopy> = {
  'program-selection': {
    title: 'Допоможемо обрати програму',
    description:
      'Розкажіть про свої цілі та залиште контакт. Команда ProPhoto допоможе обрати програму навчання.',
  },
  workshops: {
    title: 'Дізнатися про наступні воркшопи',
    description:
      'Залиште контакт і розкажіть, які теми вас цікавлять. Команда ProPhoto надасть інформацію про наступні воркшопи.',
  },
  camp: {
    title: 'Дізнатися про наступний ProPhoto кемп',
    description:
      'Залиште контакт і запитання про ProPhoto кемп. Команда надасть інформацію про наступний кемп, коли його деталі будуть підтверджені.',
  },
  'individual-training': {
    title: 'Обговорити індивідуальне навчання',
    description:
      'Розкажіть про свою мету та залиште контакт, щоб обговорити індивідуальний формат навчання.',
  },
  'corporate-training': {
    title: 'Обговорити корпоративне навчання',
    description:
      'Розкажіть про задачі команди та залиште контакт, щоб обговорити корпоративне навчання.',
  },
};

export function inquirySubjectTitle(subject: InquirySubject) {
  return subjects[subject].title;
}

export function inquiryCopy(context: InquiryContext): InquiryCopy {
  if (context.practiceSessionId)
    return {
      title: 'Дізнатися про контент-практику',
      description:
        'Залиште контакт. Повідомимо про формат, дату й вартість, коли підтвердимо деталі практики.',
    };
  if (context.subject) return subjects[context.subject];
  if (context.programId)
    return {
      title: 'Дізнатися про програму',
      description:
        'Залиште контакт і запитання. Допоможемо розібратися з програмою та форматом навчання.',
    };
  return subjects['program-selection'];
}
