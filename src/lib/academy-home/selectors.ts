import type { AcademyContent } from '@/lib/content/types';
import type { AcademyDirection } from './types';
import { academyHomePhoto } from '@/lib/photography/academy-home';
export function academyDirections(content: AcademyContent): AcademyDirection[] {
  const individual = content.programs.find((p) => p.category === 'individual');
  const corporate = content.programs.find((p) => p.category === 'corporate');
  return [
    {
      title: 'Курси',
      subtitle: 'Навчання онлайн з практикою в Києві',
      image: academyHomePhoto('courses'),
      href: '/courses',
    },
    {
      title: 'Воркшопи',
      subtitle: 'Практичне навчання в студії та на виїзді',
      image: academyHomePhoto('workshops'),
      href: '/courses',
    },
    {
      title: 'Навчання',
      subtitle: 'Офлайн програми',
      image: academyHomePhoto('offline'),
      href: '/courses',
    },
    {
      title: 'Індивідуальне навчання',
      subtitle: individual?.eyebrow || 'Навчання навколо вашої мети',
      image: academyHomePhoto('individual'),
      href: individual ? '/' + individual.slug : '/courses',
    },
    {
      title: 'Корпоративне навчання',
      subtitle: corporate?.eyebrow || 'Сильніший контент усередині команди',
      image: academyHomePhoto('corporate'),
      href: corporate ? '/' + corporate.slug : '/courses',
    },
    {
      title: 'ProPhoto кемп',
      subtitle: 'Дізнайтеся про наступний кемп',
      image: academyHomePhoto('camp-retreat'),
      inquiryTitle: 'Дізнатися про наступний ProPhoto кемп',
    },
  ];
}
export function academyHomeTestimonials(content: AcademyContent) {
  return content.testimonials.filter((t) => t.kind === 'quote' && t.quote).slice(0, 4);
}
