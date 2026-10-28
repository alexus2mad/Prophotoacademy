import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it, vi } from 'vitest';
import { InvitationNotice } from '../src/components/molecules/InvitationNotice/InvitationNotice';
import { StudentDetail } from '../src/components/organisms/StudentDetail/StudentDetail';
import { AdminTeam } from '../src/components/organisms/AdminTeam/AdminTeam';
import { demoStudentDetail, demoTeam } from '../src/lib/admin/demo';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe('invitation status and account activation', () => {
  it('keeps a sent invitation distinct from an activated account or confirmed delivery', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudentDetail, {
          detail: {
            ...demoStudentDetail,
            profile: null,
            grants: demoStudentDetail.grants.map((grant) => ({ ...grant, expires_at: null })),
            invitation: { state: 'sent', requestedAt: '2026-10-28T12:00:00Z' },
          },
        }),
      ),
    );
    expect($('.workspace-page-heading').text()).toContain('Акаунт ще не створено');
    expect($('.workspace-page-heading').text()).toContain('підтвердити код із листа');
    expect($('.invitation-notice [role="status"]').text()).toContain('передано поштовому сервісу');
    expect($('.invitation-notice').text()).not.toMatch(/доставлено|активовано/i);
    expect($('.invitation-notice button').attr('type')).toBe('button');
    expect($('.invitation-notice button').attr('aria-label')).toContain(demoStudentDetail.email);
  });

  it.each(['pending', 'retrying'] as const)(
    'does not offer a duplicate resend while the invitation is %s',
    (state) => {
      const $ = load(
        renderToStaticMarkup(
          createElement(InvitationNotice, {
            email: 'student@example.test',
            audience: 'student',
            invitation: { state, requestedAt: '2026-10-28T12:00:00Z' },
          }),
        ),
      );
      expect($('button').attr('disabled')).toBeUndefined();
      expect($('button').text()).toBe('Оновити стан');
      expect($('[role="status"]').text()).not.toMatch(/доставлено|передано поштовому сервісу/i);
    },
  );

  it('does not invite a student with only expired, revoked or empty course access', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudentDetail, {
          detail: {
            ...demoStudentDetail,
            grants: [
              { ...demoStudentDetail.grants[0], expires_at: '2000-01-01T00:00:00Z' },
              {
                ...demoStudentDetail.grants[0],
                id: 'revoked-grant',
                expires_at: null,
                revoked_at: '2026-10-27T00:00:00Z',
              },
              {
                ...demoStudentDetail.grants[0],
                id: 'empty-grant',
                expires_at: null,
                lesson_ids: [],
              },
            ],
          },
        }),
      ),
    );
    expect($('.invitation-notice')).toHaveLength(0);
    expect($('.student-grants li')).toHaveLength(3);
  });

  it('offers a pending administrator an invitation without presenting their rights as active', () => {
    const $ = load(renderToStaticMarkup(createElement(AdminTeam, { data: demoTeam, demo: true })));
    expect($('.invitation-notice')).toHaveLength(demoTeam.invitations.length);
    const pendingRow = $('.invitation-notice').closest('tr');
    expect(pendingRow.text()).toContain('Права очікують першого входу');
    expect(pendingRow.find('button').text()).toBe('Надіслати запрошення');
    expect(pendingRow.text()).toContain('Запрошення ще не надсилали');
    expect($('.admin-team-table[role="table"]')).toHaveLength(1);
    expect($('.admin-team-table th[scope="col"][role="columnheader"]')).toHaveLength(2);
    expect(pendingRow.find('[role="cell"]')).toHaveLength(2);
  });
});
