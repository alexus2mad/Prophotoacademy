import { createBlock } from './blocks';
import type { PageTemplateDefinition, PageTemplateId, SitePage } from './types';

export const pageTemplates = [
  {
    id: 'blank',
    label: 'Чиста сторінка',
    description: 'Обкладинка та місце для власних блоків',
    blocks: [],
  },
  {
    id: 'editorial',
    label: 'Стаття',
    description: 'Текст та фотографія для історії або публікації',
    blocks: ['paragraph', 'image'],
  },
  {
    id: 'course',
    label: 'Курс',
    description: 'Вступ, заголовок програми й картки модулів',
    blocks: ['paragraph', 'heading', 'cards'],
  },
  {
    id: 'workshop',
    label: 'Воркшоп',
    description: 'Опис події та карусель робіт',
    blocks: ['paragraph', 'carousel'],
  },
] as const satisfies ReadonlyArray<PageTemplateDefinition>;

export function templateShell(page: SitePage, template: PageTemplateId): SitePage {
  return { ...page, template, sections: page.sections.filter((s) => s.id === 'landing-cover') };
}

export function applyPageTemplate(page: SitePage, template: PageTemplateId): SitePage {
  const shell = structuredClone(templateShell(page, template));
  const preset = pageTemplates.find((entry) => entry.id === template)!;
  return { ...shell, sections: [...shell.sections, ...preset.blocks.map(createBlock)] };
}
