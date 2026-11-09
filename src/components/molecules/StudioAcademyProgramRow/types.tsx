import type { ImageAsset, Offering, Program } from '@/lib/content/types';

export type StudioAcademyProgramRowProps = {
  program: Program;
  offering?: Offering;
  asset?: Pick<ImageAsset, 'src' | 'width' | 'height'>;
  asOf?: string;
  heading?: 'h2' | 'h3';
};
