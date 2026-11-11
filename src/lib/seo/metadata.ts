import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-images/metadata';
import type { AcademyDesign } from '@/lib/studio-design/types';
import { academyCanonical } from './urls';
import type { AcademyMetadataOptions } from './types';

export const academyName = 'ProPhoto Academy';

export function academyIndexMetadata(design: AcademyDesign, noindex = false) {
  return academyMetadata('/academy', {
    title: 'Курси фотографії, відео та створення контенту',
    description:
      'Оберіть курс фотографії, предметної зйомки або створення контенту для Instagram. Навчання онлайн і в Києві, воркшопи та програми для команд.',
    socialKey: design === 'legacy' ? '/courses' : '/academy',
    noindex,
  });
}

export function academyMetadata(path: string, options: AcademyMetadataOptions): Metadata {
  const canonical = academyCanonical(path);
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical },
    ...(options.noindex ? { robots: { index: false, follow: false } } : {}),
    ...socialMetadata(options.socialKey ?? path, {
      path: canonical,
      ...(options.socialTitle
        ? { title: options.socialTitle, description: options.description }
        : {}),
    }),
  };
}
