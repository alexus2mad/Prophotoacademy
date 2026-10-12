import type { CourseDraft } from '@/lib/learning/types';
export type CourseOutlineProps = {
  draft: CourseDraft;
  activeId: string;
  activeBlockId?: string;
  onLesson: (id: string) => void;
  onBlock: (id: string) => void;
  onModuleTitle: (id: string, title: string) => void;
  onMoveModule: (id: string, direction: number) => void;
  onMoveLesson: (moduleId: string, id: string, direction: number) => void;
  onAddLesson: (id: string) => void;
  onAddModule: () => void;
};
