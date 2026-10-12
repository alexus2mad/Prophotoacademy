import type { LessonBlockProps } from '@/lib/learning/types';
export type LessonImageSlideProps = LessonBlockProps & { onNavigate: (direction: number) => void };
