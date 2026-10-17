// Renders the Supabase Auth email templates from the same branded layout as the
// app's emails. Paste each file into Supabase → Authentication → Emails, with its
// subject. Re-run with the public origin when the domain changes:
//   pnpm exec tsx scripts/render-auth-emails.ts https://prophotoacademy.com.ua
import { writeFile } from 'node:fs/promises';
import { renderEmail } from '../src/lib/notifications/email-layout';
import type { EmailContent } from '../src/lib/notifications/types';

const origin = process.argv[2] || 'https://staging.prophotoacademy.com.ua';
const shared = {
  code: '{{ .Token }}',
  note: 'Код дійсний 10 хвилин. Якщо ви не запитували вхід, просто проігноруйте цей лист — без коду ніхто не зможе увійти.',
};
const templates: Record<string, EmailContent> = {
  'confirm-signup': {
    subject: 'Підтвердьте email у ProPhoto Academy',
    preheader: 'Введіть цей код, щоб підтвердити email і увійти до кабінету.',
    heading: 'Підтвердьте email',
    paragraphs: [
      'Вітаємо в ProPhoto Academy! Введіть цей код на сторінці входу, щоб підтвердити email і відкрити кабінет.',
    ],
    ...shared,
  },
  'magic-link': {
    subject: 'Ваш код входу до ProPhoto Academy',
    preheader: 'Введіть цей код на сторінці входу до кабінету.',
    heading: 'Код для входу',
    paragraphs: ['Введіть цей код на сторінці входу, щоб відкрити кабінет ProPhoto Academy.'],
    ...shared,
  },
};
for (const [name, content] of Object.entries(templates)) {
  const { subject, html } = renderEmail(content, origin);
  await writeFile(`supabase/templates/${name}.html`, html + '\n');
  console.log(`${name}.html — subject: ${subject}`);
}
