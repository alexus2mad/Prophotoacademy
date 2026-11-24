import type {
  blockTypes,
  intensiveBlockTypes,
  pageTemplateIds,
  textFonts,
  textSizes,
  textColors,
  textAlignments,
  textWeights,
} from './options';

export type BlockType = (typeof blockTypes)[number];
export type IntensiveBlockType = (typeof intensiveBlockTypes)[number];
export type PageTemplateId = (typeof pageTemplateIds)[number];
export type PlacementDefinition = { id: string; label: string };
export type BlockPosition = { slot: string; beforeBlockId?: string };
export type BlockDefinition = { type: BlockType; label: string; description: string };
export type PageTemplateDefinition = {
  id: PageTemplateId;
  label: string;
  description: string;
  blocks: readonly BlockType[];
};
export type TextStyle = {
  font?: (typeof textFonts)[number];
  size?: (typeof textSizes)[number];
  color?: (typeof textColors)[number];
  align?: (typeof textAlignments)[number];
  weight?: (typeof textWeights)[number];
};
export type SitePageKind = 'home' | 'course' | 'workshop' | 'landing';
export type SiteField = {
  id: string;
  label: string;
  kind: 'text' | 'multiline' | 'image';
  value: string;
  style?: TextStyle;
};
export type SiteSection = {
  id: string;
  label: string;
  fields: SiteField[];
  blockType?: BlockType;
  placement?: string;
  itemIds?: string[];
};
export type SitePage = {
  path: string;
  title: string;
  kind: SitePageKind;
  sections: SiteSection[];
  template?: PageTemplateId;
  offerId?: string;
  /** Set only for the authorized preview response. Excluded from the document schema. */
  editorPreview?: boolean;
};
export type SitePageSummary = Pick<SitePage, 'path' | 'title' | 'kind'> & {
  hasDraft: boolean;
  published: boolean;
  /** ISO time of the latest saved change, when the storage records it. */
  updatedAt?: string | null;
  /** First photograph of the page, for the list preview. */
  cover?: string;
};
export type EditorPage = {
  page: SitePage;
  revision: string | null;
  hasDraft: boolean;
  published: boolean;
};
export type SiteRouteProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};
export type PageGroupId =
  | 'home'
  | 'courses'
  | 'workshops'
  | 'training'
  | 'services'
  | 'about'
  | 'legal'
  | 'other';
export type PageGroup<T> = { id: PageGroupId; label: string; pages: T[] };
export type EnvironmentState = { published: boolean; hasDraft: boolean; updatedAt: string | null };
/** A page address with its state on each environment the admin manages. */
export type BrowserPage = Pick<SitePage, 'path' | 'title' | 'kind'> & {
  cover?: string;
  production?: EnvironmentState;
  staging?: EnvironmentState;
  differs?: 'new' | 'changed';
};
