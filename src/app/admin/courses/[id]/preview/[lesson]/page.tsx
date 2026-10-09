import { pageMember } from '@/lib/auth/server';
import { getDraft } from '@/lib/learning/authoring';
import { courseEditorData } from '@/lib/admin/queries';
import { LessonPreview } from '@/components/templates/LessonPreview/LessonPreview';
import { notFound } from 'next/navigation';
import type { PreviewPageProps } from '@/app/types';
export default async function Preview({ params }: PreviewPageProps) {
  const { id, lesson } = await params;
  await pageMember(`/admin/courses/${id}/preview/${lesson}`, true);
  const [draft, data] = await Promise.all([getDraft(id), courseEditorData(id)]);
  const selected = draft.modules.flatMap((m) => m.lessons).find((l) => l.id === lesson);
  if (!selected) notFound();
  return (
    <LessonPreview
      course={draft}
      lesson={selected}
      sessions={JSON.parse(JSON.stringify(data.sessions))}
    />
  );
}
