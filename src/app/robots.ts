import type { MetadataRoute } from 'next';
import { indexingDisabled } from '@/lib/seo/crawl';
import { academyCanonical } from '@/lib/seo/urls';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/', '/operations'],
    },
    ...(indexingDisabled() ? {} : { sitemap: academyCanonical('/sitemap.xml') }),
  };
}
