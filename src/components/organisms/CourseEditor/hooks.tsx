'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMutation } from '@/lib/admin/hooks';
import { hasFinalQuiz } from '@/lib/learning/presentation';
import { numberedLessons } from '@/lib/learning/numbering';
import { changeCourseBlock } from '@/lib/learning/editor';
import type { CourseDraft, LearningBlock } from '@/lib/learning/types';
import type {
  CourseEditorProps,
  LessonChange,
  BlockChange,
  DraftUpdate,
  EditorSection,
} from './types';
export function useCourseEditor({ initial, demo }: CourseEditorProps) {
  const [draft, setDraft] = useState(initial),
    [activeId, selectLesson] = useState(initial.modules[0]?.lessons[0]?.id || ''),
    [activeBlockId, selectBlock] = useState(''),
    [outlineOpen, setOutlineOpen] = useState(false),
    [section, setSection] = useState<EditorSection>('content'),
    [uploading, setUploading] = useState(false),
    [dirty, setDirty] = useState(false),
    [publishedLessons, setPublishedLessons] = useState<string[]>([]);
  const h = useAdminMutation(demo),
    router = useRouter(),
    canvas = useRef<HTMLDivElement>(null),
    focusRequested = useRef(false),
    publishDialog = useRef<HTMLDialogElement>(null);
  const active = draft.modules.flatMap((m) => m.lessons).find((l) => l.id === activeId);
  const module = draft.modules.find((m) => m.lessons.some((l) => l.id === activeId));
  const activeBlock = active?.blocks.find((b) => b.id === activeBlockId) || active?.blocks[0];
  useEffect(() => {
    const screen = matchMedia('(min-width: 1000px)');
    const resize = () => setOutlineOpen(screen.matches);
    resize();
    screen.addEventListener('change', resize);
    return () => screen.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    if (!dirty && !uploading) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, uploading]);
  useEffect(() => {
    if (!focusRequested.current || !canvas.current) return;
    focusRequested.current = false;
    canvas.current.focus({ preventScroll: true });
    const offset = parseFloat(getComputedStyle(canvas.current).scrollMarginTop) || 0;
    window.scrollTo({
      top: window.scrollY + canvas.current.getBoundingClientRect().top - offset,
      behavior: 'instant',
    });
  }, [activeId, activeBlockId, outlineOpen]);
  function focusEditor() {
    focusRequested.current = true;
    if (matchMedia('(max-width: 999px)').matches) setOutlineOpen(false);
  }
  function setActiveBlockId(id: string) {
    selectBlock(id);
    focusEditor();
  }
  function setActiveId(id: string) {
    selectLesson(id);
    selectBlock('');
    focusEditor();
  }
  function update(value: DraftUpdate) {
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
    update((current) => changeCourseBlock(current, id, change));
  }
  function addModule() {
    update({
      ...draft,
      modules: [...draft.modules, { id: crypto.randomUUID(), title: 'Новий модуль', lessons: [] }],
    });
  }
  function addLesson(moduleId: string) {
    const id = crypto.randomUUID();
    const number = Math.max(0, ...numberedLessons(draft).map((l) => l.number || 0)) + 1;
    update({
      ...draft,
      modules: draft.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [...m.lessons, { id, number, title: 'Новий урок', summary: '', blocks: [] }],
            }
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
    if (kind === 'quiz' && active?.blocks.some((b) => b.kind === 'quiz')) {
      setActiveBlockId(active.blocks.find((b) => b.kind === 'quiz')!.id);
      return;
    }
    const id = crypto.randomUUID();
    if (active)
      lesson({
        blocks: [
          ...active.blocks.filter((b) => b.kind !== 'quiz'),
          {
            id,
            kind,
            title: '',
            required: kind === 'quiz',
            revision: 1,
            ...(kind === 'article' ? { body: '' } : {}),
            ...(kind === 'quiz' ? { quiz: { passingScore: 80, questions: [] } } : {}),
          },
          ...active.blocks.filter((b) => b.kind === 'quiz'),
        ],
      });
    setActiveBlockId(id);
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
      value: { revision: draft.revision, lessonIds: publishedLessons },
    });
    router.refresh();
  }
  function openPublish() {
    setPublishedLessons(
      draft.modules
        .flatMap((m) => m.lessons)
        .filter(hasFinalQuiz)
        .map((l) => l.id),
    );
    publishDialog.current?.showModal();
  }
  function selectPublishedLesson(id: string, selected: boolean) {
    setPublishedLessons((current) =>
      selected ? [...current, id] : current.filter((value) => value !== id),
    );
  }
  return {
    ...h,
    draft,
    update,
    active,
    activeBlock,
    canvas,
    outlineOpen,
    setOutlineOpen,
    setActiveBlockId,
    section,
    setSection,
    uploading,
    setUploading,
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
    openPublish,
    publishedLessons,
    selectPublishedLesson,
    publishDialog,
  };
}
