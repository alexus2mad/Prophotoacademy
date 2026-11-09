import type { Instructor } from '@/lib/content/types';
import type { StudioAsset } from '@/lib/studio-design/types';

export type StudioProgramArtwork = { asset: StudioAsset; alt: string };
export type StudioProgramInstructor = Instructor & StudioProgramArtwork;
