import type { SitePage } from '@/lib/site-editor/types';
import type { Testimonial } from '@/lib/content/types';

export type StudioProgramReviewsProps = { page?: SitePage } & { reviews: Testimonial[] };
