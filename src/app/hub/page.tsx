import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { canonicalUrl } from '@/lib/ecosystem';
import { HubHomeTemplate } from '@/components/templates/HubHomeTemplate/HubHomeTemplate';
export const metadata: Metadata = { alternates: { canonical: canonicalUrl('hub') } };
export default async function HubHome() {
  return <HubHomeTemplate content={await getContent()} />;
}
