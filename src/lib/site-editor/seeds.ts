import { cache } from 'react';
import { getContent } from '@/lib/content';
import { buildSiteSeeds } from './seed-model';
export const getSiteSeeds = cache(async () => buildSiteSeeds(await getContent()));
export { newSitePage } from './fields';
