import type {
  blockTypes,
  pageTemplateIds,
  textFonts,
  textSizes,
  textColors,
  textAlignments,
  textWeights,
} from './options';

export type BlockType = (typeof blockTypes)[number];
export type PageTemplateId = (typeof pageTemplateIds)[number];
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
  itemIds?: string[];
};
export type SitePage = {
  path: string;
  title: string;
  kind: SitePageKind;
  sections: SiteSection[];
  template?: PageTemplateId;
};
export type SitePageSummary = Pick<SitePage, 'path' | 'title' | 'kind'> & {
  hasDraft: boolean;
  published: boolean;
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
