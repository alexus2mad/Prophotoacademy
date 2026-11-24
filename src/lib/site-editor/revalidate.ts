import { revalidatePath } from 'next/cache';
import type { SitePage } from './types';

/** Refresh the public routes a newly published page appears on. */
export function revalidatePublication(page: SitePage) {
  revalidatePath(page.path);
  if (page.kind === 'course' || page.kind === 'workshop') revalidatePath('/academy');
  revalidatePath('/sitemap.xml');
}
