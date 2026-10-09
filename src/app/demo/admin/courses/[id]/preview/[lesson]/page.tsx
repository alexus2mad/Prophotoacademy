import { demoCourse, demoSession } from '@/lib/learning/demo';
import { LessonPreview } from '@/components/templates/LessonPreview/LessonPreview';
import { notFound } from 'next/navigation';
import type { PreviewPageProps } from '@/app/types';
export function generateStaticParams() {
  return demoCourse.modules
    .flatMap((m) => m.lessons)
    .map((l) => ({ id: demoCourse.id, lesson: l.id }));
}
export default async function Preview({ params }: PreviewPageProps) {
  const { id, lesson } = await params;
  const selected = demoCourse.modules.flatMap((m) => m.lessons).find((l) => l.id === lesson);
  if (id !== demoCourse.id || !selected) notFound();
  return <LessonPreview course={demoCourse} lesson={selected} sessions={[demoSession]} demo />;
}
