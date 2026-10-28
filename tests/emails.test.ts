import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { orderEmail } from '../src/lib/notifications/emails';
import { renderEmail } from '../src/lib/notifications/email-layout';
import { invitationEmail } from '../src/lib/notifications/invitations';
import type { NotificationJob } from '../src/lib/notifications/types';

const origin = 'https://academy.example';
const order = (extra: Partial<NotificationJob['data']> = {}): NotificationJob['data'] => ({
  mode: 'wayforpay',
  status: 'approved',
  programTitle: 'Візуальний контент',
  packageName: 'BASE',
  amount: 7125,
  promoCode: 'LORA',
  discountPercent: 5,
  orderId: 'ppa-123',
  customer: { email: 'buyer@example.test', name: 'Олена' },
  fulfillment: { courseId: 'course' },
  ...extra,
});

describe('branded order emails', () => {
  it('chooses the message for each order outcome', () => {
    const subject = (kind: string, data: NotificationJob['data']) =>
      orderEmail(kind, data, origin)?.subject;
    expect(subject('order-status', order())).toBe('Ваш курс уже в кабінеті');
    expect(subject('order-status', order({ fulfillment: undefined }))).toBe(
      'Оплату підтверджено — відкриваємо доступ',
    );
    expect(subject('order-status', order({ productKind: 'product' }))).toBe('Оплату підтверджено');
    expect(subject('enrollment', order({ mode: 'disabled', status: 'enrolled', amount: 0 }))).toBe(
      'Тестовий доступ до курсу відкрито',
    );
    expect(subject('order-status', order({ status: 'refunded' }))).toBe(
      'Повернення оплати підтверджено',
    );
    expect(subject('order-status', order({ status: 'declined' }))).toBeUndefined();
    expect(subject('payment-event', order())).toBeUndefined();
    expect(subject('order-status', order({ customer: undefined }))).toBeUndefined();
  });
  it('summarises the order and links to the account', () => {
    const email = orderEmail('order-status', order(), origin)!;
    expect(email.details).toEqual([
      { label: 'Замовлення', value: 'Візуальний контент — BASE' },
      { label: 'Сума', value: '7 125 ₴' },
      { label: 'Промокод', value: 'LORA (−5%)' },
      { label: 'Номер замовлення', value: 'ppa-123' },
    ]);
    expect(email.action).toEqual({ label: 'Перейти до навчання', href: origin + '/account' });
  });
  it('renders escaped, branded HTML with a plain-text alternative', () => {
    const email = orderEmail(
      'order-status',
      order({ customer: { email: 'x@example.test', name: '<script>Ann</script>' } }),
      origin,
    )!;
    const { html, text, subject } = renderEmail(email, origin);
    expect(subject).toBe('Ваш курс уже в кабінеті');
    expect(html).toContain(origin + '/brand/prophoto-study-email.png');
    expect(html).toContain('href="https://academy.example/account"');
    expect(html).toContain('&lt;script&gt;Ann&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(text).toContain('Перейти до навчання: https://academy.example/account');
    expect(text).toContain('Номер замовлення: ppa-123');
  });
});

describe('Supabase auth templates', () => {
  it('carry the code placeholder inside the shared layout', async () => {
    for (const name of ['confirm-signup', 'magic-link']) {
      const html = await readFile(`supabase/templates/${name}.html`, 'utf8');
      expect(html).toContain('{{ .Token }}');
      expect(html).toContain('/brand/prophoto-study-email.png');
      expect(html).toContain('academyprophoto@gmail.com');
    }
  });
});

describe('access invitation emails', () => {
  it('links both audiences to normal email-code login without issuing credentials', () => {
    for (const kind of ['admin-invitation', 'access-invitation']) {
      const content = invitationEmail(
        {
          id: 'invitation',
          kind,
          attempts: 0,
          data: {
            customer: { email: 'learner@example.test' },
            programTitle: '<script>Course</script>',
            packageName: 'BASE',
          },
        },
        'https://staging.prophotoacademy.com.ua',
      )!;
      const login = new URL(content.action!.href);
      expect(login.origin).toBe('https://staging.prophotoacademy.com.ua');
      expect(login.pathname).toBe('/login');
      expect(login.searchParams.get('next')).toBe(
        kind === 'admin-invitation' ? '/admin' : '/account',
      );
      expect(content.code).toBeUndefined();
      expect(content.subject).toContain('Staging');
      expect(content.note).toContain('тестової платформи');
      expect(content.paragraphs.join(' ')).toContain('окремий лист із кодом');
      const rendered = renderEmail(content, login.origin);
      expect(rendered.html).not.toContain('<script>');
      if (kind === 'access-invitation') expect(rendered.html).toContain('&lt;script&gt;Course');
    }
  });
  it('does not turn unrelated events into invitations', () => {
    expect(
      invitationEmail({ id: 'x', kind: 'payment-event', attempts: 0, data: order() }, origin),
    ).toBeNull();
  });
});
