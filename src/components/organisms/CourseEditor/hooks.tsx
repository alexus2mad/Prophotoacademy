'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMutation } from '@/lib/admin/hooks';
import type { CourseDraft, LearningBlock } from '@/lib/learning/types';
import type { CourseEditorProps, LessonChange, BlockChange } from './types';
export function useCourseEditor({ initial, demo }: CourseEditorProps) {
  const [draft, setDraft] = useState(initial),
    [activeId, setActiveId] = useState(initial.modules[0]?.lessons[0]?.id || ''),
    [dirty, setDirty] = useState(false),
    [preview, setPreview] = useState(false);
  const h = useAdminMutation(demo),
    router = useRouter(),
    publishDialog = useRef<HTMLDialogElement>(null);
  const active = draft.modules.flatMap((m) => m.lessons).find((l) => l.id === activeId);
  const module = draft.modules.find((m) => m.lessons.some((l) => l.id === activeId));
  function update(value: CourseDraft) {
    setDraft(value);
    setDirty(true);
    h.setMessage('');
  }
  function lesson(change: LessonChange) {
    update({
      ...draft,
      modules: draft.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === activeId ? { ...l, ...change } : l)),
      })),
    });
  }
  function block(id: string, change: BlockChange) {
    if (!active) return;
    lesson({
      blocks: active.blocks.map((b) =>
        b.id === id ? { ...b, ...change, revision: b.revision + 1 } : b,
      ),
    });
  }
  function addModule() {
    update({
      ...draft,
      modules: [...draft.modules, { id: crypto.randomUUID(), title: 'Новий модуль', lessons: [] }],
    });
  }
  function addLesson(moduleId: string) {
    const id = crypto.randomUUID();
    update({
      ...draft,
      modules: draft.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, { id, title: 'Новий урок', summary: '', blocks: [] }] }
          : m,
      ),
    });
    setActiveId(id);
  }
  function moveLesson(moduleId: string, id: string, direction: number) {
    const m = draft.modules.find((m) => m.id === moduleId);
    if (!m) return;
    const lessons = [...m.lessons],
      index = lessons.findIndex((l) => l.id === id),
      next = index + direction;
    if (next < 0 || next >= lessons.length) return;
    [lessons[index], lessons[next]] = [lessons[next], lessons[index]];
    update({
      ...draft,
      modules: draft.modules.map((m) => (m.id === moduleId ? { ...m, lessons } : m)),
    });
  }
  function moveModule(id: string, direction: number) {
    const modules = [...draft.modules],
      index = modules.findIndex((m) => m.id === id),
      next = index + direction;
    if (next < 0 || next >= modules.length) return;
    [modules[index], modules[next]] = [modules[next], modules[index]];
    update({ ...draft, modules });
  }
  function addBlock(kind: LearningBlock['kind']) {
    if (active)
      lesson({
        blocks: [
          ...active.blocks,
          {
            id: crypto.randomUUID(),
            kind,
            title: '',
            required: kind !== 'file',
            revision: 1,
            ...(kind === 'article' ? { body: '' } : {}),
          },
        ],
      });
  }
  function moveBlock(id: string, direction: number) {
    if (!active) return;
    const blocks = [...active.blocks],
      index = blocks.findIndex((b) => b.id === id),
      next = index + direction;
    if (next < 0 || next >= blocks.length) return;
    [blocks[index], blocks[next]] = [blocks[next], blocks[index]];
    lesson({ blocks });
  }
  async function save() {
    if (demo) {
      setDirty(false);
      h.setMessage('Демонстраційна чернетка змінена лише на цій сторінці');
      return;
    }
    const saved = await h.mutate<CourseDraft>(`/api/admin/courses/${draft.id}`, {
      action: 'save',
      value: draft,
    });
    if (saved) {
      setDraft(saved);
      setDirty(false);
    }
  }
  async function publish() {
    publishDialog.current?.close();
    await h.mutate(`/api/admin/courses/${draft.id}`, {
      action: 'publish',
      value: { revision: draft.revision },
    });
    router.refresh();
  }
  return {
    ...h,
    draft,
    update,
    active,
    activeId,
    setActiveId,
    module,
    lesson,
    block,
    addModule,
    addLesson,
    moveLesson,
    moveModule,
    addBlock,
    moveBlock,
    dirty,
    save,
    publish,
    publishDialog,
    preview,
    setPreview,
  };
}
