import {canonicalUrl} from '@/lib/ecosystem';
export function GET(){return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /studio\nDisallow: /operations\nDisallow: /booking\nSitemap: ${canonicalUrl('hub','sitemap.xml')}\n`,{headers:{'Content-Type':'text/plain'}});}
