import { pageMember } from '@/lib/auth/server';
import { studentLesson } from '@/lib/learning/service';
import { LessonPlayer } from '@/components/templates/LessonPlayer/LessonPlayer';
import { notFound } from 'next/navigation';
import { HttpError } from '@/lib/http';
import type { LearningPageProps } from '@/app/types';
export const metadata = { title: 'Навчання — ProPhoto', robots: { index: false, follow: false } };
export default async function LessonPage({ params }: LearningPageProps) {
  const { course, lesson } = await params;
  const member = await pageMember(`/learn/${course}/${lesson}`);
  try {
    const view = await studentLesson(member.id, course, lesson);
    return <LessonPlayer key={lesson} view={JSON.parse(JSON.stringify(view))} userId={member.id} />;
  } catch (error) {
    if (error instanceof HttpError && error.status === 403) notFound();
    throw error;
  }
}
