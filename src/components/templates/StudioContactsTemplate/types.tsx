import type { SitePage } from '@/lib/site-editor/types';
import type { SiteSettings } from '@/lib/content/types';
export type StudioContactsTemplateProps = {
  settings: SiteSettings;
  page?: SitePage;
  intro?: { label: string; accent: string; title: string };
};
