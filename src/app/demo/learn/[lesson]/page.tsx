import { notFound } from 'next/navigation';
import { LessonPlayer } from '@/components/templates/LessonPlayer/LessonPlayer';
import { demoEnrollment, demoMember } from '@/lib/learning/demo';
import type { DemoLessonPageProps } from '@/app/types';
export const metadata = {
  title: 'Демонстрація уроку — ProPhoto',
  robots: { index: false, follow: false },
};
export function generateStaticParams() {
  return demoEnrollment.course.modules.flatMap((m) => m.lessons.map((l) => ({ lesson: l.id })));
}
export default async function DemoLesson({ params }: DemoLessonPageProps) {
  const { lesson: id } = await params;
  const lessons = demoEnrollment.course.modules.flatMap((m) => m.lessons),
    lesson = lessons.find((l) => l.id === id);
  if (!lesson) notFound();
  return (
    <LessonPlayer
      key={id}
      demo
      userId={demoMember.id}
      view={{
        enrollment: demoEnrollment,
        lesson,
        progress: demoEnrollment.progress.find((p) => p.lesson_id === id)?.state || { blocks: {} },
        nextLessonId: lessons[lessons.indexOf(lesson) + 1]?.id,
      }}
    />
  );
}
