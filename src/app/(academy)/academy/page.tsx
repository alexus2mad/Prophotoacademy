import type { SiteRouteProps } from '@/lib/site-editor/types';
import { readSitePage } from '@/lib/site-editor/public';
import { listNewSitePages } from '@/lib/site-editor/public';
import { connection } from 'next/server';
import { getContent } from '@/lib/content';
import { prioritizePrograms } from '@/lib/program-priority';
import { academyDesign } from '@/lib/studio-design/variant';
import { CatalogTemplate } from '@/components/templates/CatalogTemplate/CatalogTemplate';
import { StudioAcademyTemplate } from '@/components/templates/StudioAcademyTemplate/StudioAcademyTemplate';
import { academyIndexMetadata } from '@/lib/seo/metadata';

export function generateMetadata() {
  return academyIndexMetadata(academyDesign());
}

export default async function Academy({ searchParams }: SiteRouteProps = {}) {
  const content = await getContent();
  if (academyDesign() === 'studio') {
    const [page, additionalPages] = await Promise.all([
      readSitePage('/academy', searchParams),
      listNewSitePages(),
    ]);
    return (
      <StudioAcademyTemplate content={content} page={page} additionalPages={additionalPages} />
    );
  }

  const query = new URLSearchParams();
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== 'pages') {
    await connection();
    for (const [key, value] of Object.entries((await searchParams) ?? {})) {
      if (value === undefined) continue;
      for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
    }
  }
  return (
    <CatalogTemplate
      content={content}
      programs={prioritizePrograms(content.programs, content.settings.primaryProgramId)}
      query={query.toString()}
    />
  );
}
