import type { AcademyContent, HubSettings } from '@/lib/content/types';
export type HubHeroProps = { content: Pick<AcademyContent, 'rooms' | 'images'>; hub: HubSettings };
