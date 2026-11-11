import type { Program, SiteSettings } from '@/lib/content/types';
import { academyName } from './metadata';
import type { BreadcrumbItem } from './types';
import { academyCanonical } from './urls';

const context = 'https://schema.org';
const language = 'uk';

function academyIdentity() {
  const home = academyCanonical('/');
  return { home, organizationId: `${home}#academy`, websiteId: `${home}#website` };
}

export function academyHomeSchema(settings: SiteSettings, description: string) {
  const { home, organizationId, websiteId } = academyIdentity();
  const street = /^Київ,\s*(.+)$/u.exec(settings.address)?.[1];
  return {
    '@context': context,
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': organizationId,
        name: academyName,
        ...(settings.name !== academyName ? { alternateName: settings.name } : {}),
        url: home,
        description,
        logo: academyCanonical('/brand/prophoto-apple-icon.png'),
        email: settings.email,
        telephone: settings.phone,
        ...(street
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: street,
                addressLocality: 'Київ',
                addressCountry: 'UA',
              },
            }
          : {}),
        areaServed: { '@type': 'Country', name: 'Україна' },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: home,
        name: academyName,
        ...(settings.name !== academyName ? { alternateName: settings.name } : {}),
        inLanguage: language,
        publisher: { '@id': organizationId },
      },
    ],
  };
}

export function academyCourseSchema(program: Program) {
  const { home, organizationId } = academyIdentity();
  const url = academyCanonical(`/${program.slug}`);
  return {
    '@context': context,
    '@type': 'Course',
    '@id': `${url}#course`,
    name: program.title,
    description: program.description,
    url,
    inLanguage: language,
    provider: {
      '@id': organizationId,
      '@type': 'EducationalOrganization',
      name: academyName,
      url: home,
    },
  };
}

export function academyBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': context,
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: academyCanonical(path),
    })),
  };
}
