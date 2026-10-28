import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { CourseCurriculum } from '../src/components/molecules/CourseCurriculum/CourseCurriculum';
import { demoEnrollment } from '../src/lib/learning/demo';
import { lessonHref } from '../src/lib/learning/selectors';

describe('lesson curriculum disclosures', () => {
  it.each([false, true])(
    'starts every module collapsed while identifying the current module (demo: %s)',
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

      expect($('details.curriculum-module')).toHaveLength(demoEnrollment.course.modules.length);
      expect($('.curriculum-module[open]')).toHaveLength(0);
      expect($('.curriculum-module[data-current]')).toHaveLength(1);
      expect($('.curriculum-module[data-current="true"] > summary').text()).toBe(
        currentModule.title,
      );
      expect($('.curriculum-lesson[aria-current="page"]')).toHaveLength(1);
      expect($('.curriculum-lesson[aria-current="page"]').attr('href')).toBe(
        lessonHref(demoEnrollment.course.id, currentLesson.id, demo),
      );
      expect($('.lesson-chapters a[aria-current="location"]').attr('href')).toBe(
        '#material-' + currentChapter.id,
      );
    },
  );

  it('does not identify or expand a module when the lesson is absent', () => {
    const $ = load(
      renderToStaticMarkup(
        createElement(CourseCurriculum, {
          enrollment: demoEnrollment,
          lessonId: 'missing-lesson',
          currentProgress: { blocks: {} },
        }),
      ),
    );

    expect($('.curriculum-module[open], .curriculum-module[data-current]')).toHaveLength(0);
    expect($('.curriculum-lesson[aria-current], .lesson-chapters')).toHaveLength(0);
  });
});
