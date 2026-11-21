import type { SitePage, SitePageSummary } from '@/lib/site-editor/types';
import type { PreviewField } from '@/components/molecules/SiteEditorPreview/types';

export type SiteContentEditorProps = { initialPages: SitePageSummary[]; writable: boolean };
export type NewPageValues = Pick<SitePage, 'path' | 'title' | 'kind'>;
export type EditorTask = 'load' | 'save' | 'publish' | 'upload' | 'create' | null;
export type EditorPanel = 'fields' | 'preview';
export type UploadedSiteImage = { url: string };
export type CanvasImageTarget = PreviewField & { path: string };
