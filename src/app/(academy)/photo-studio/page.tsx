import type { SiteRouteProps } from '@/lib/site-editor/types';
import { readSitePage } from '@/lib/site-editor/public';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioSpacesTemplate } from '@/components/templates/StudioSpacesTemplate/StudioSpacesTemplate';
import { academyMetadata } from '@/lib/seo/metadata';

export const metadata = academyMetadata('/photo-studio', {
  title: 'Фотостудія',
  description: 'Огляд просторів для фото та відеозйомок у Києві.',
  noindex: true,
});
export default async function PhotoStudio({ searchParams }: SiteRouteProps = {}) {
  if (academyDesign() === 'legacy') redirect('/hub');
  return (
    <StudioSpacesTemplate
      page={await readSitePage('/photo-studio', searchParams)}
      content={await getContent()}
    />
  );
}
