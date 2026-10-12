import type { LessonTableProps } from './types';

export function LessonTable({ children }: LessonTableProps) {
  return (
    <div
      className="lesson-table-scroll"
      role="region"
      aria-label="Таблиця навчального матеріалу"
      tabIndex={0}
    >
      <table>{children}</table>
    </div>
  );
}
