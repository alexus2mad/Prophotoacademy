import { listedPrograms } from '@/lib/content/selectors';
import type { AcademyContent } from '@/lib/content/types';
import type { SitePage } from './types';
import { brandSeeds } from './brand-seeds';
import { programPresentationContent } from './program';
import {
  aboutContent,
  contactContent,
  worksContent,
  reviewsContent,
  legalContent,
} from './support-pages';

export function buildSiteSeeds(content: AcademyContent): SitePage[] {
  const pages = brandSeeds(content);
  const claimed = new Set(pages.map((page) => page.path));
  for (const program of listedPrograms(content.programs)) {
    const path = '/' + program.slug;
    if (claimed.has(path)) continue;
    const { sections } = programPresentationContent(content, program);
    pages.push({
      path,
      title: program.title,
      kind: program.category === 'class' ? 'workshop' : 'course',
      sections,
    });
  }
  for (const item of content.pages)
    pages.push({
      path: '/' + item.slug,
      title: item.title,
      kind: 'landing',
      sections: legalContent(item).sections,
    });
  pages.push(
    {
      path: '/about-us',
      title: 'Про академію',
      kind: 'landing',
      sections: aboutContent(content).sections,
    },
    {
      path: '/contacts',
      title: 'Контакти',
      kind: 'landing',
      sections: contactContent(content).sections,
    },
    {
      path: '/student-work',
      title: 'Роботи студентів',
      kind: 'landing',
      sections: worksContent(content).sections,
    },
    {
      path: '/reviews',
      title: 'Відгуки студентів',
      kind: 'landing',
      sections: reviewsContent(content).sections,
    },
  );
  return pages;
}
