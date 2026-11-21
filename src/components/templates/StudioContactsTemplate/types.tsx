import type { SiteSettings } from '@/lib/content/types';
export type StudioContactsTemplateProps = {
  settings: SiteSettings;
  intro?: { label: string; accent: string; title: string };
};
