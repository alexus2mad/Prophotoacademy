import type {
  AcademyContent,
  Offering,
  PracticeSession,
  Program,
  StudioRoom,
} from '@/lib/content/types';
export type PracticeTemplateProps = {
  session: PracticeSession;
  content: AcademyContent;
  ready: boolean;
  space: StudioRoom;
  offering?: Offering;
  program?: Program;
};
