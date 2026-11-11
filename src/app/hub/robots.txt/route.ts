import { canonicalUrl } from '@/lib/ecosystem';
import { indexingDisabled } from '@/lib/seo/crawl';
export function GET() {
  const sitemap = indexingDisabled() ? '' : `Sitemap: ${canonicalUrl('hub', 'sitemap.xml')}\n`;
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /studio\nDisallow: /operations\n${sitemap}`,
    { headers: { 'Content-Type': 'text/plain' } },
  );
}
