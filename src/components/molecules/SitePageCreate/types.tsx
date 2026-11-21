import type { SitePage } from '@/lib/site-editor/types';
export type SitePageCreateProps = {
  busy: boolean;
  onCancel: () => void;
  onCreate: (page: Pick<SitePage, 'kind' | 'path' | 'title'>) => void;
};
