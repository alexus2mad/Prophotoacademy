import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { LessonProse } from '../src/components/molecules/LessonProse/LessonProse';

const render = (children: string) =>
  load(renderToStaticMarkup(createElement(LessonProse, { children })));

describe('lesson Markdown', () => {
  it('renders real table headers and a keyboard-scrollable region', () => {
    const $ = render('| Світло | Тінь |\n| --- | --- |\n| М’яке | Плавний перехід |');
    expect($('table').length).toBe(1);
    expect(
      $('thead th')
        .map((_, element) => $(element).text())
        .get(),
    ).toEqual(['Світло', 'Тінь']);
    expect($('tbody td').last().text()).toBe('Плавний перехід');
    expect($('table').parent().attr('role')).toBe('region');
    expect($('table').parent().attr('tabindex')).toBe('0');
    expect($('table').parent().attr('aria-label')).toBeTruthy();
  });

  it('keeps lesson and block headings above article headings and preserves nested lists', () => {
    const $ = render(
      '# Вступ\n\n## Напрямок світла\n\n### Приклад\n\n1. Знайдіть світло\n   - Подивіться на тінь\n   - Змініть напрямок\n2. Зробіть кадр',
    );
    expect($('h1, h2').length).toBe(0);
    expect($('h3').text()).toBe('Вступ');
    expect($('h4').text()).toBe('Напрямок світла');
    expect($('h5').text()).toBe('Приклад');
    expect($('ol > li').length).toBe(2);
    expect($('ol > li > ul > li').length).toBe(2);
  });

  it('normalizes existing article subheadings without skipping a level', () => {
    const $ = render('### Змініть точку зйомки\n\nТекст\n\n#### Приклад');
    expect($('h3').text()).toBe('Змініть точку зйомки');
    expect($('h4').text()).toBe('Приклад');
  });

  it('does not allow Markdown to load unprotected images or execute raw HTML and unsafe URLs', () => {
    const $ = render(
      '![Private photo](https://example.test/photo.jpg)\n\n<script>alert(1)</script>\n\n[Unsafe](javascript:alert)\n\n**Головне** та *пояснення*',
    );
    expect($('img, script').length).toBe(0);
    expect($('a').attr('href')).not.toContain('javascript:');
    expect($('strong').text()).toBe('Головне');
    expect($('em').text()).toBe('пояснення');
  });
});
