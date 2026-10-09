import type { LessonBlockProps, MediaAccess } from '@/lib/learning/types';
import type { ComponentRef } from 'react';
import type MuxPlayer from '@mux/mux-player-react';
export type LearningVideoProps = LessonBlockProps & { media: MediaAccess };
export type LearningVideoElement = HTMLVideoElement | ComponentRef<typeof MuxPlayer>;
export type PlayerPreferences = {
  volume: number;
  muted: boolean;
  speed: number;
  captionLanguage?: string;
};
