import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it, vi } from 'vitest';
import type { EnrollmentCardView } from '../../src/lib/learning/types';
import type { FontOptions } from './types';
import { WorkspaceShell } from '../../src/components/templates/WorkspaceShell/WorkspaceShell';
import { StudentOverview } from '../../src/components/organisms/StudentOverview/StudentOverview';
import { AccountSettings } from '../../src/components/organisms/AccountSettings/AccountSettings';
import { PurchaseHistory } from '../../src/components/organisms/PurchaseHistory/PurchaseHistory';
import { LessonPreview } from '../../src/components/templates/LessonPreview/LessonPreview';
import { demoCourse, demoMember } from '../../src/lib/learning/demo';

vi.mock('next/font/local', () => ({
  default: (options: FontOptions) => ({ variable: options.variable, className: options.variable }),
}));

const course: EnrollmentCardView = {
  id: 'enrollment',
  courseId: 'course',
  title: 'Курс',
  cover: '/images/instagram.webp',
  packageName: 'BASE',
  progress: 1 / 3,
  completed: 1,
  total: 3,
  nextLessonId: 'lesson-2',
  nextLessonTitle: 'Лекція 2 — Композиція',
  expiresAt: null,
  status: 'active',
};

describe('selective student presentation', () => {
  it.each([false, true])('keeps the admin shell outside the student theme (admin: %s)', (admin) => {
    const $ = load(
      renderToStaticMarkup(
        createElement(WorkspaceShell, {
          member: demoMember,
          admin,
          demo: true,
          children: createElement('h1', null, 'Кабінет'),
        }),
      ),
    );
    expect($('.academy-theme')).toHaveLength(admin ? 0 : 1);
    expect($('.workspace-student')).toHaveLength(admin ? 0 : 1);
    expect($('.workspace-admin')).toHaveLength(admin ? 1 : 0);
    expect($('.workspace-nav a')).toHaveLength(admin ? 6 : 3);
  });

  it('keeps one resume action and omits a meeting placeholder', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(StudentOverview, {
          name: 'Олена',
          courses: [course, { ...course, id: 'other', courseId: 'other' }],
          demo: true,
        }),
      ),
    );
    expect($('.student-page-heading h1').text()).toBe('Моє навчання');
    expect($('.student-dashboard-grid a.button:not(.button-secondary)')).toHaveLength(1);
    expect($('.next-session-card')).toHaveLength(0);
    expect($('.other-learning-courses .button-secondary')).toHaveLength(1);
  });

  it('keeps account settings labeled and connects the email explanation', () => {
    const $ = load(
      renderToStaticMarkup(createElement(AccountSettings, { member: demoMember, demo: true })),
    );
    expect($('label[for="account-name"]')).toHaveLength(1);
    expect($('#account-email[readonly]').attr('aria-describedby')).toBe('account-email-help');
    expect($('#account-email-help').text()).toContain('доступ до курсів');
    expect($('[role="status"][aria-atomic="true"]')).toHaveLength(1);
  });

  it('keeps purchase history an accessible empty record', () => {
    const $ = load(renderToStaticMarkup(createElement(PurchaseHistory, { purchases: [] })));
    expect($('.purchase-history-empty').text()).toBe('Покупок за цим email поки немає');
    expect($('table')).toHaveLength(0);
  });

  it('uses the same reading theme in the lesson preview without student mutations', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(LessonPreview, {
          course: demoCourse,
          lesson: demoCourse.modules[0].lessons[0],
          sessions: [],
          demo: true,
        }),
      ),
    );
    expect($('.lesson-app.academy-theme')).toHaveLength(1);
    expect($('.learning-demo-note').text()).toContain('прогрес не записується');
    expect($('.lesson-content [data-card-motion]')).toHaveLength(0);
  });
});
