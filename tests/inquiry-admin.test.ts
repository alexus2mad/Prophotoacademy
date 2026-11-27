import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inquiriesForwarded, inquiryRecord } from '../src/lib/inquiries/admin';
import { AdminInquiries } from '../src/components/organisms/AdminInquiries/AdminInquiries';
import { WorkspaceShell } from '../src/components/templates/WorkspaceShell/WorkspaceShell';

vi.mock('next/font/local', () => ({
  default: () => ({ variable: 'font-test', className: 'font-test' }),
}));

afterEach(() => vi.unstubAllEnvs());

const stored = {
  id: 'inquiry-1',
  created_at: '2026-11-23T12:48:00Z',
  data: {
    name: 'Олена',
    contact: '+380000000000',
    message: 'Дізнатися про доступ до записів',
    programTitle: 'Візуальний контент',
    packageName: 'GOLD',
    source: 'consultation',
    site: 'academy',
    marketingUpdates: true,
  },
  state: 'delivered',
  attempts: 0,
};

describe('inquiry delivery reporting', () => {
  it('treats an inquiry as forwarded only when an HTTPS webhook is configured', () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('MAKE_WEBHOOK_URL', '');
    expect(inquiriesForwarded()).toBe(false);
    vi.stubEnv('MAKE_WEBHOOK_URL', 'http://hook.example.test/x');
    vi.stubEnv('NOTIFICATION_MODE', 'make');
    expect(inquiriesForwarded()).toBe(false);
    vi.stubEnv('MAKE_WEBHOOK_URL', 'https://hook.example.test/x');
    expect(inquiriesForwarded()).toBe(true);
    vi.stubEnv('NOTIFICATION_MODE', 'local');
    expect(inquiriesForwarded()).toBe(false);
  });

  it('maps stored inquiries and their delivery state', () => {
    expect(inquiryRecord(stored)).toMatchObject({
      name: 'Олена',
      programTitle: 'Візуальний контент',
      packageName: 'GOLD',
      marketingUpdates: true,
      delivery: 'delivered',
      createdAt: '2026-11-23T12:48:00.000Z',
    });
    expect(inquiryRecord({ ...stored, state: 'pending', attempts: 0 }).delivery).toBe('pending');
    expect(inquiryRecord({ ...stored, state: 'pending', attempts: 2 }).delivery).toBe('failed');
    expect(inquiryRecord({ ...stored, state: 'local' }).delivery).toBe('local');
    expect(
      inquiryRecord({ ...stored, data: JSON.stringify({ contact: 'a@b.c' }), state: null })
        .programTitle,
    ).toBeUndefined();
  });
});

describe('administrator inquiry list', () => {
  it('lists each inquiry with its contact, request and delivery state', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(AdminInquiries, { inquiries: [inquiryRecord(stored)], forwarded: true }),
      ),
    );
    expect($('h1').text()).toBe('Заявки');
    expect($('p').first().text()).toContain('Реєстрація на курс');
    const row = $('tbody tr');
    expect(row).toHaveLength(1);
    expect(row.text()).toContain('+380000000000');
    expect(row.text()).toContain('Візуальний контент · GOLD');
    expect(row.text()).toContain('Форма на сторінці · погоджується на розсилку');
    expect(row.text()).toContain('Надіслано в Telegram');
  });

  it('explains local capture and the empty state', () => {
    const $ = load(
      renderToStaticMarkup(createElement(AdminInquiries, { inquiries: [], forwarded: false })),
    );
    expect($.text()).toContain('лише зберігаються');
    expect($.text()).toContain('Заявок ще немає.');
  });

  it('links the inquiry list from the administrator navigation outside the demo', () => {
    const member = {
      id: 'm',
      email: 'admin@example.test',
      name: 'Admin',
      role: 'admin' as const,
      verified_at: '2026-11-27T00:00:00Z',
      created_at: '2026-11-27T00:00:00Z',
    };
    const nav = (demo: boolean) =>
      load(
        renderToStaticMarkup(
          createElement(WorkspaceShell, {
            member,
            admin: true,
            demo,
            section: 'inquiries',
            children: null,
          }),
        ),
      )('nav a[href$="/admin/inquiries"]');
    expect(nav(false)).toHaveLength(1);
    expect(nav(true)).toHaveLength(0);
  });
});
