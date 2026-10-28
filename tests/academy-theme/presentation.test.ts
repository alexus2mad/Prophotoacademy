import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../../content/academy.json';
import type { AcademyContent } from '../../src/lib/content/types';
import type { EnrollmentCardView } from '../../src/lib/learning/types';
import type { FontOptions } from './types';
import { SiteShell } from '../../src/components/templates/SiteShell/SiteShell';
import { StatusFrame } from '../../src/components/templates/StatusFrame/StatusFrame';
import { WorkspaceShell } from '../../src/components/templates/WorkspaceShell/WorkspaceShell';
import { StudentOverview } from '../../src/components/organisms/StudentOverview/StudentOverview';
import { ProgramTemplate } from '../../src/components/templates/ProgramTemplate/ProgramTemplate';
import { ProgramPackages } from '../../src/components/organisms/ProgramPackages/ProgramPackages';
import { LessonPreview } from '../../src/components/templates/LessonPreview/LessonPreview';
import { demoCourse, demoMember, demoSession } from '../../src/lib/learning/demo';

const navigation = vi.hoisted(() => ({ path: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.path }));
vi.mock('next/font/local', () => ({
  default: (options: FontOptions) => ({ variable: options.variable, className: options.variable }),
}));

const content = fixture as AcademyContent;
const render = (element: ReactElement) => load(renderToStaticMarkup(element));
const course: EnrollmentCardView = {
  id: 'enrollment-1',
  courseId: 'course-1',
  title: 'Курс із трьома лекціями',
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

beforeEach(() => {
  navigation.path = '/';
});

describe('Academy presentation boundaries', () => {
  it.each([
    { path: '/missing-page', academy: true },
    { path: '/hub/missing-page', academy: false },
    { path: '/hub', academy: false },
  ])('keeps status content scoped to its site at $path', ({ path, academy }) => {
    navigation.path = path;
    const $ = render(
      createElement(StatusFrame, {
        children: createElement('h1', null, 'Сторінку не знайдено'),
      }),
    );
    expect($('.academy-theme').length).toBe(academy ? 1 : 0);
    expect($('.status-panel h1').text()).toBe('Сторінку не знайдено');
    expect($('main').length).toBe(0);
  });

  it('wraps Academy content and dialogs in the theme without applying it to Hub', () => {
    const academy = render(
      createElement(SiteShell, {
        site: 'academy',
        settings: content.settings,
        children: createElement('h1', null, 'Програми'),
      }),
    );
    expect(academy('.academy-theme main#main h1').text()).toBe('Програми');
    expect(academy('.academy-theme .inquiry-dialog').length).toBe(1);
    expect(academy('.academy-theme .site-header').length).toBe(1);
    navigation.path = '/hub';
    const hub = render(
      createElement(SiteShell, {
        site: 'hub',
        settings: content.hub,
        children: createElement('h1', null, 'Студія'),
      }),
    );
    expect(hub('.academy-theme').length).toBe(0);
    expect(hub('main#main h1').text()).toBe('Студія');
    expect(hub('a[href$="/hub/booking"]').length).toBeGreaterThan(0);
  });

  it('keeps checkout focused on completion while retaining return and legal links', () => {
    navigation.path = '/checkout';
    const $ = render(
      createElement(SiteShell, {
        site: 'academy',
        settings: content.settings,
        children: createElement('h1', null, 'Ваше замовлення'),
      }),
    );
    expect($('.site-header .desktop-nav, .site-header .header-account-link').length).toBe(0);
    expect($('.header-actions a[href="/courses"]').text()).toBe('До програм');
    expect($('.footer-focused a[href="/terms-of-service"]').length).toBe(1);
    expect($('.footer-focused a[href="/privacy-policy"]').length).toBe(1);
  });

  it('shares the workspace theme and keeps administration and the cashbox separate', () => {
    const $ = render(
      createElement(WorkspaceShell, {
        member: demoMember,
        admin: true,
        demo: true,
        section: 'students',
        children: createElement('h1', null, 'Студенти'),
      }),
    );
    expect($('.academy-theme .workspace-content h1').text()).toBe('Студенти');
    expect($('.workspace-nav [aria-current="page"]').attr('href')).toBe('/demo/admin/students');
    const cashbox = $('.workspace-nav a').filter((_, element) => $(element).text() === 'Каса');
    expect(new URL(cashbox.attr('href')!).protocol).toBe('https:');
    expect(cashbox.attr('target')).toBe('_blank');
    expect(cashbox.attr('rel')).toContain('noopener');
    expect($('.workspace-nav a[href="/admin/cashbox"]').length).toBe(0);
    expect($('.site-header, .site-footer').length).toBe(0);
  });

  it('keeps the shared reading-font boundary inside the themed administrator preview', () => {
    const $ = render(
      createElement(LessonPreview, {
        course: demoCourse,
        lesson: demoCourse.modules[0].lessons[0],
        sessions: [],
        demo: true,
      }),
    );
    expect($('.academy-theme .lesson-content').length).toBe(1);
    expect($('.lesson-content').attr('class')).toContain('--font-reading');
    expect($('.lesson-content .lesson-prose').length).toBeGreaterThan(0);
    expect($('.lesson-preview-back').attr('href')).toBe('/demo/admin/courses/instagram');
    expect($('.learning-demo-note').text()).toContain('прогрес не записується');
    expect($('.lesson-content [data-card-motion]').length).toBe(0);
  });
});

describe('program purchase decisions', () => {
  const offering = structuredClone(content.offerings[0]);
  offering.packages.forEach((pack, index) => {
    pack.availability = index === 2 ? 'soldOut' : 'open';
  });
  const program = content.programs.find((item) => item.id === offering.programId)!;
  const first = offering.packages[0];

  it('keeps verified package links distinct from inquiries and sold-out states', () => {
    const $ = render(
      createElement(ProgramPackages, {
        offering,
        program,
        enrollment: {
          mode: 'disabled',
          packageIds: [first.id],
          lessonTitles: { [first.id]: ['Лекція 2 — Композиція', 'Лекція 3 — Світло'] },
        },
      }),
    );
    const cards = $('.package-grid .package-card');
    expect(cards.length).toBe(offering.packages.length);
    const purchase = cards.eq(0).find('a[href^="/checkout?"]');
    expect(purchase.length).toBe(1);
    expect(purchase.text()).toBe('Отримати доступ');
    const query = new URL(purchase.attr('href')!, 'https://academy.example').searchParams;
    expect(query.get('offering')).toBe(offering.id);
    expect(query.get('package')).toBe(first.id);
    expect(cards.eq(0).text()).toContain('Лекція 2 — Композиція');
    expect(cards.eq(0).text()).toContain('Лекція 3 — Світло');
    expect(cards.eq(1).find('a[href^="/checkout?"]').length).toBe(0);
    expect(cards.eq(1).find('button').text()).toBe('Уточнити пакет');
    expect(cards.eq(2).find('a[href^="/checkout?"], button').length).toBe(0);
    expect(cards.eq(2).text()).toContain('Місць немає');
    expect($('.package-source-note').text()).toContain('без оплати');
    expect($('button[aria-haspopup="dialog"]').length).toBeGreaterThan(0);
  });

  it('keeps packages before the overview without a duplicate desktop enrollment panel', () => {
    const $ = render(
      createElement(ProgramTemplate, {
        program,
        content: {
          ...content,
          offerings: content.offerings.map((item) => (item.id === offering.id ? offering : item)),
        },
        enrollment: { mode: 'disabled', packageIds: [first.id] },
      }),
    );
    const sections = $('.program-landing').children().toArray();
    expect(sections.indexOf($('#packages')[0])).toBeLessThan(
      sections.indexOf($('#program-overview')[0]),
    );
    const gallery = $('.program-hero-photo [role="region"]');
    expect(gallery.attr('aria-roledescription')).toBe('карусель');
    expect(gallery.attr('aria-label')).toContain(program.shortTitle);
    const photos = gallery.find('img');
    expect(photos.length).toBe(5);
    expect(new Set(photos.map((_, image) => $(image).attr('src')).get()).size).toBe(5);
    expect(gallery.find('.photo-stack-print[aria-hidden="false"]').length).toBe(1);
    expect(gallery.find('.photo-stack-print[aria-hidden="false"]').attr('data-depth')).toBe('0');
    const stage = gallery.find('button.photo-stack-stage');
    expect(stage.attr('type')).toBe('button');
    expect(stage.is(':disabled')).toBe(false);
    expect(stage.attr('aria-label')).toContain('Наступне фото');
    for (const label of ['Попереднє фото', 'Наступне фото']) {
      const control = gallery.find(`button[aria-label="${label}"]`);
      expect(control.length).toBe(1);
      expect(control.attr('type')).toBe('button');
      expect(control.is(':disabled')).toBe(false);
    }
    expect(gallery.find('[aria-live="polite"]').text()).toContain('Фото 1 з 5');
    expect($('.program-hero a[href="#packages"]').length).toBe(0);
    expect($('#packages .package-grid a[href^="/checkout?"]').length).toBe(1);
    expect($('.program-landing .enrollment-panel').length).toBe(0);
    const mobileEnrollment = $('.mobile-enroll');
    expect(mobileEnrollment.find('a.button[href="#packages"]').text()).toBe('Обрати пакет');
    expect(mobileEnrollment.find('a.button[href="#packages"]').length).toBe(1);
    expect(mobileEnrollment.attr('aria-hidden')).toBe('true');
    expect(mobileEnrollment.is('[inert]')).toBe(true);
    const overview = $('#program-overview');
    expect(
      overview
        .find('h2')
        .slice(0, 3)
        .map((_, heading) => $(heading).text())
        .get(),
    ).toEqual(['Чого ви навчитеся', 'Для кого ця програма', 'Що будемо вивчати']);
    for (const text of [...program.outcomes, ...program.audience]) {
      expect(overview.text()).toContain(text);
    }
    expect(
      overview
        .find('details > summary')
        .map((_, summary) => $(summary).text())
        .get(),
    ).toEqual(program.modules.map((module) => module.title));
    for (const module of program.modules) {
      for (const topic of module.topics) expect(overview.text()).toContain(topic);
    }
  });
});

describe('student dashboard decisions', () => {
  it('keeps one resume action and omits a meeting panel when there is no meeting', () => {
    const $ = render(createElement(StudentOverview, { name: '', courses: [course] }));
    expect($('a[href="/learn/course-1/lesson-2"]').text()).toBe('Продовжити навчання');
    expect($('progress').attr('value')).toBe('33');
    expect($('aside').length).toBe(0);
    expect($('[data-card-motion]').length).toBe(0);
  });

  it('retains expired-course records without offering an inaccessible lesson', () => {
    const expired: EnrollmentCardView = { ...course, id: 'expired', status: 'expired' };
    const $ = render(createElement(StudentOverview, { name: '', courses: [expired, course] }));
    expect($('article').length).toBe(2);
    expect($('.is-featured a[href="/learn/course-1/lesson-2"]').length).toBe(1);
    expect($('.other-learning-courses article a').length).toBe(0);
    expect($('.other-learning-courses').text()).toContain('Термін доступу завершився');
    expect($('.other-learning-courses progress').attr('value')).toBe('33');
  });

  it('keeps synthetic lesson and meeting links within the review routes', () => {
    const $ = render(
      createElement(StudentOverview, {
        name: '',
        courses: [course],
        nextSession: demoSession,
        demo: true,
      }),
    );
    expect($('a[href="/demo/learn/lesson-2"]').length).toBe(1);
    expect($('aside a').attr('href')).toBe('/demo/learn/live-review');
    expect($('aside').text()).toContain('Київ');
    expect($('a[href^="/learn/"]').length).toBe(0);
  });

  it('gives an unenrolled student a catalog path without promising a payment state', () => {
    const $ = render(createElement(StudentOverview, { name: '', courses: [] }));
    expect($('.workspace-empty a').attr('href')).toBe('/courses');
    expect($('.workspace-empty').text()).not.toMatch(/підтвердження оплати/i);
    expect($('article, progress, aside').length).toBe(0);
  });
});
