import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { academyDesign } from '@/lib/studio-design/variant';
import { StudioShopTemplate } from '@/components/templates/StudioShopTemplate/StudioShopTemplate';

export const metadata: Metadata = { title: 'Магазин', alternates: { canonical: '/shop' } };
export default async function Shop() {
  if (academyDesign() === 'legacy') redirect('/contacts');
  return <StudioShopTemplate content={await getContent()} />;
}
