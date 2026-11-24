import type { SitePage, SitePageSummary, PageTemplateId } from '@/lib/site-editor/types';
import type { PreviewField } from '@/components/molecules/SiteEditorPreview/types';

import type { WorkshopTicketChoice } from '@/lib/site-editor/workshop-ticket/types';
export type SiteContentEditorProps = {
  initialPages: SitePageSummary[];
  writable: boolean;
  tickets?: WorkshopTicketChoice[];
};
export type NewPageValues = Pick<SitePage, 'path' | 'title' | 'kind'> & {
  template: PageTemplateId;
};
export type EditorTask = 'load' | 'save' | 'publish' | 'create' | null;
export type EditorPanel = 'fields' | 'preview';
export type CanvasImageTarget = PreviewField & { path: string };
