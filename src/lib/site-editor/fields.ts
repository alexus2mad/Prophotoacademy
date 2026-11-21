import type { SiteField, SitePage, SiteSection } from './types';

export function siteField(
  id: string,
  label: string,
  value: string,
  kind: SiteField['kind'] = 'text',
): SiteField {
  return { id, label, kind, value };
}

export function siteSection(id: string, label: string, fields: SiteField[]): SiteSection {
  return { id, label, fields };
}

export function readField(
  page: SitePage | undefined,
  sectionId: string,
  id: string,
  fallback = '',
): string {
  return (
    page?.sections
      .find((section) => section.id === sectionId)
      ?.fields.find((field) => field.id === id)?.value ?? fallback
  );
}

export function newSitePage(
  path: string,
  title: string,
  kind: Exclude<SitePage['kind'], 'home'>,
): SitePage {
  return {
    path,
    title,
    kind,
    sections: [
      siteSection('landing-cover', 'Перший екран', [
        siteField('title', 'Заголовок', title),
        siteField('description', 'Вступ', '', 'multiline'),
        siteField('image', 'Обкладинка', '', 'image'),
        siteField('alt', 'Опис обкладинки', ''),
      ]),
      siteSection('landing-body', 'Про програму', [
        siteField('heading', 'Заголовок розділу', ''),
        siteField('text', 'Текст розділу', '', 'multiline'),
        siteField('image', 'Фотографія', '', 'image'),
        siteField('alt', 'Опис фотографії', ''),
      ]),
    ],
  };
}
