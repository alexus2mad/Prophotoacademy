import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { CourseCurriculum } from '../src/components/molecules/CourseCurriculum/CourseCurriculum';
import { demoEnrollment } from '../src/lib/learning/demo';
import { lessonHref } from '../src/lib/learning/selectors';

describe('lesson curriculum disclosures', () => {
  it.each([false, true])(
    'keeps lecture titles visible with only the current lecture chapters collapsed (demo: %s)',
    (demo) => {
      const currentModule = demoEnrollment.course.modules[1];
      const currentLesson = currentModule.lessons[0];
      const currentChapter = currentLesson.blocks.find((block) => block.kind === 'article')!;
      const $ = load(
        renderToStaticMarkup(
          createElement(CourseCurriculum, {
            enrollment: demoEnrollment,
            lessonId: currentLesson.id,
            currentProgress: { blocks: {} },
            currentChapterId: currentChapter.id,
            demo,
          }),
        ),
      );

      expect($('section.curriculum-module')).toHaveLength(demoEnrollment.course.modules.length);
      expect($('details.curriculum-module')).toHaveLength(0);
      expect($('details.curriculum-lecture')).toHaveLength(1);
      expect($('details[open]')).toHaveLength(0);
      expect($('.curriculum-module[data-current]')).toHaveLength(1);
      expect($('.curriculum-module[data-current="true"] > h2').text()).toBe(currentModule.title);
      expect($('.curriculum-lesson[aria-current="page"]')).toHaveLength(1);
      expect($('summary.curriculum-lesson[aria-current="page"]')).toHaveLength(1);
      expect($('.curriculum-lecture > .lesson-chapters')).toHaveLength(1);
      expect($('.lesson-chapters a[aria-current="location"]').attr('href')).toBe(
        '#material-' + currentChapter.id,
      );
      const otherLessons = demoEnrollment.course.modules
        .flatMap((module) => module.lessons)
        .filter((lesson) => lesson.id !== currentLesson.id);
      expect($('a.curriculum-lesson')).toHaveLength(otherLessons.length);
      for (const lesson of otherLessons) {
        const link = $('a.curriculum-lesson').filter(
          (_, element) =>
            $(element).attr('href') === lessonHref(demoEnrollment.course.id, lesson.id, demo),
        );
        expect(link).toHaveLength(1);
        expect(link.closest('details')).toHaveLength(0);
      }
    },
  );

  it('keeps all lessons as direct links when the current lesson is absent', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(CourseCurriculum, {
          enrollment: demoEnrollment,
          lessonId: 'missing-lesson',
          currentProgress: { blocks: {} },
        }),
      ),
    );

    expect($('details, .curriculum-module[data-current]')).toHaveLength(0);
    expect($('.curriculum-lesson[aria-current], .lesson-chapters')).toHaveLength(0);
  });

  it('does not disclose chapters when current-lesson access is unavailable', () => {
    const currentLesson = demoEnrollment.course.modules[1].lessons[0];
    const $ = load(
      renderToStaticMarkup(
        createElement(CourseCurriculum, {
          enrollment: { ...demoEnrollment, grants: [] },
          lessonId: currentLesson.id,
          currentProgress: { blocks: {} },
        }),
      ),
    );
    expect($('details, .lesson-chapters')).toHaveLength(0);
    expect($('.curriculum-lesson[aria-current="page"]').attr('aria-disabled')).toBe('true');
    expect($('.curriculum-lesson[aria-current="page"]').attr('href')).toBe('#');
  });
});
