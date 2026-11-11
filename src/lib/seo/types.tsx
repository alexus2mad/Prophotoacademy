import type { Metadata } from 'next';

export type AcademyMetadataOptions = {
  title: NonNullable<Metadata['title']>;
  description?: string;
  socialKey?: string;
  socialTitle?: string;
  noindex?: boolean;
};

export type BreadcrumbItem = { name: string; path: string };
