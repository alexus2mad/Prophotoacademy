export type SitePageKind = 'home' | 'course' | 'workshop' | 'landing';
export type SiteField = {
  id: string;
  label: string;
  kind: 'text' | 'multiline' | 'image';
  value: string;
};
export type SiteSection = { id: string; label: string; fields: SiteField[] };
export type SitePage = { path: string; title: string; kind: SitePageKind; sections: SiteSection[] };
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
