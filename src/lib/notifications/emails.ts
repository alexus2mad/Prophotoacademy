import { money } from '../format';
import type { EmailContent, EmailDetail, NotificationJob } from './types';

// The order summary every purchase email shares.
function orderDetails(data: NotificationJob['data']): EmailDetail[] {
  const rows: EmailDetail[] = [];
  const product = [data.programTitle, data.packageName].filter(Boolean).join(' — ');
  if (product) rows.push({ label: 'Замовлення', value: product });
  if (typeof data.amount === 'number')
    rows.push({
      label: data.mode === 'disabled' ? 'До сплати' : 'Сума',
      value: money(data.amount),
    });
  if (data.promoCode)
    rows.push({
      label: 'Промокод',
      value: `${data.promoCode}${data.discountPercent ? ` (−${data.discountPercent}%)` : ''}`,
    });
  const reference = data.orderId || data.id;
  if (reference) rows.push({ label: 'Номер замовлення', value: reference });
  return rows;
}

// Customer emails for one order event, or null when that event sends none.
export function orderEmail(
  kind: string,
  data: NotificationJob['data'],
  origin: string,
): EmailContent | null {
  if (!['order-status', 'enrollment'].includes(kind) || !data.customer?.email) return null;
  const account = new URL('/account', origin).href;
  const greeting = data.customer.name ? `${data.customer.name}, дякуємо!` : 'Дякуємо!';
  const details = orderDetails(data);
  const product = data.productKind === 'product';
  if (data.status === 'refunded')
    return {
      subject: 'Повернення оплати підтверджено',
      preheader: 'Платіжна система підтвердила повернення коштів за замовленням.',
      heading: 'Повернення оплати підтверджено',
      paragraphs: [
        'Платіжна система підтвердила повернення коштів. Строк зарахування на картку залежить від вашого банку.',
        ...(product ? [] : ['Доступ до навчання за цим замовленням закрито.']),
      ],
      details,
      note: 'Якщо повернення стало несподіванкою, напишіть нам — ми допоможемо розібратися.',
    };
  if (data.status === 'enrolled')
    return {
      subject: 'Тестовий доступ до курсу відкрито',
      preheader: 'Курс уже у вашому кабінеті. Кошти не списувалися.',
      heading: 'Тестовий доступ відкрито',
      paragraphs: [
        greeting,
        'Курс уже у вашому кабінеті. Це тестовий доступ: кошти не списувалися, майбутнього списання не буде.',
        'Увійдіть за email, який ви вказали під час оформлення, — код для входу прийде окремим листом.',
      ],
      details,
      action: { label: 'Перейти до навчання', href: account },
    };
  if (data.status !== 'approved') return null;
  if (product)
    return {
      subject: 'Оплату підтверджено',
      preheader: 'Дякуємо за покупку! Команда академії зв’яжеться з вами щодо деталей.',
      heading: 'Оплату підтверджено',
      paragraphs: [greeting, 'Оплату отримано. Команда академії зв’яжеться з вами щодо деталей.'],
      details,
    };
  if (!data.fulfillment)
    return {
      subject: 'Оплату підтверджено — відкриваємо доступ',
      preheader: 'Команда академії відкриє доступ до навчання найближчим часом.',
      heading: 'Оплату підтверджено',
      paragraphs: [
        greeting,
        'Оплату отримано. Команда академії відкриє вам доступ до навчання і зв’яжеться з вами найближчим часом.',
        'Щойно доступ відкриється, курс з’явиться в кабінеті — увійдіть за email, який ви вказали під час оформлення.',
      ],
      details,
      action: { label: 'Відкрити кабінет', href: account },
    };
  return {
    subject: 'Ваш курс уже в кабінеті',
    preheader: 'Оплату підтверджено — можна починати навчання.',
    heading: 'Ваш курс уже в кабінеті',
    paragraphs: [
      greeting,
      'Оплату підтверджено, доступ до навчання відкрито.',
      'Увійдіть за email, який ви вказали під час оформлення, — код для входу прийде окремим листом.',
    ],
    details,
    action: { label: 'Перейти до навчання', href: account },
  };
}
