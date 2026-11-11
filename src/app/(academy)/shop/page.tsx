import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioShopTemplate } from '@/components/templates/StudioShopTemplate/StudioShopTemplate';
import { academyMetadata } from '@/lib/seo/metadata';

export const metadata = academyMetadata('/shop', {
  title: 'Магазин',
  description: 'ProPhoto Shop: реквізит і матеріали для створення контенту.',
  noindex: true,
});
export default async function Shop() {
  if (academyDesign() === 'legacy') redirect('/contacts');
  return <StudioShopTemplate content={await getContent()} />;
}
