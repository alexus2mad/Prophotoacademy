'use client';
import { useEffect, useRef, useState } from 'react';
import type { EditorPage, SitePage } from '@/lib/site-editor/types';
import type { PreviewField } from '@/components/molecules/SiteEditorPreview/types';
import {
  EditorRequestError,
  fetchEditorPage,
  uploadEditorImage,
  writeEditorPage,
} from './requests';
import type {
  CanvasImageTarget,
  EditorPanel,
  EditorTask,
  NewPageValues,
  SiteContentEditorProps,
} from './types';

const leave = 'Є незбережені зміни. Залишити їх і продовжити?';

function setAddress(path: string | null) {
  const url = new URL(window.location.href);
  if (path) url.searchParams.set('page', path);
  else url.searchParams.delete('page');
  window.history.replaceState(window.history.state, '', url);
}

export function useSiteContentEditor({ initialPages, writable }: SiteContentEditorProps) {
  const [pages, setPages] = useState(initialPages);
  const [record, setRecord] = useState<EditorPage | null>(null);
  const [page, setPage] = useState<SitePage | null>(null);
  const [sectionId, setSectionId] = useState('');
  const [panel, setPanel] = useState<EditorPanel>('preview');
  const [task, setTask] = useState<EditorTask>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const lock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const imagePicker = useRef<HTMLInputElement>(null);
  const imageTarget = useRef<CanvasImageTarget | null>(null);
  const dirty = !!page && !!record && JSON.stringify(page) !== JSON.stringify(record.page);

  function accept(result: EditorPage) {
    setRecord(result);
    setPage(result.page);
    setSectionId((id) =>
      result.page.sections.some((s) => s.id === id) ? id : (result.page.sections[0]?.id ?? ''),
    );
    setPages((list) => {
      const entry = {
        path: result.page.path,
        title: result.page.title,
        kind: result.page.kind,
        hasDraft: result.hasDraft,
        published: result.published,
      };
      return list.some((p) => p.path === entry.path)
        ? list.map((p) => (p.path === entry.path ? entry : p))
        : [...list, entry];
    });
    setAddress(result.page.path);
    setCreating(false);
    setConflict(false);
    setPreviewKey((n) => n + 1);
  }

  useEffect(() => {
    const path = new URL(window.location.href).searchParams.get('page');
    if (!path) return;
    const controller = new AbortController();
    setTask('load');
    lock.current = true;
    fetchEditorPage(path, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) accept(result);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : 'Не вдалося відкрити сторінку');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          lock.current = false;
          setTask(null);
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!dirty) return;
    function guard(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    function guardLink(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (
        event.defaultPrevented ||
        !(link instanceof HTMLAnchorElement) ||
        link.target === '_blank' ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      if (link.href !== window.location.href && !window.confirm(leave)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener('beforeunload', guard);
    document.addEventListener('click', guardLink, true);
    return () => {
      window.removeEventListener('beforeunload', guard);
      document.removeEventListener('click', guardLink, true);
    };
  }, [dirty]);

  async function perform(type: Exclude<EditorTask, null>, action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setTask(type);
    setMessage('');
    setError('');
    try {
      await action();
    } catch (e) {
      if (e instanceof EditorRequestError && e.status === 409 && type !== 'create') {
        setConflict(true);
        setError(
          'Інший адміністратор змінив цю сторінку. Ваш текст залишився в полях. Скопіюйте потрібні зміни та відкрийте актуальну версію',
        );
      } else setError(e instanceof Error ? e.message : 'Не вдалося виконати дію. Спробуйте ще раз');
    } finally {
      lock.current = false;
      setTask(null);
    }
  }

  function focusHeading() {
    requestAnimationFrame(() => heading.current?.focus());
  }
  function open(path: string) {
    if (dirty && !window.confirm(leave)) return;
    void perform('load', async () => {
      accept(await fetchEditorPage(path));
      setPanel('preview');
      focusHeading();
    });
  }
  function library() {
    if (lock.current || (dirty && !window.confirm(leave))) return;
    setRecord(null);
    setPage(null);
    setError('');
    setMessage('');
    setConflict(false);
    setCreating(false);
    setAddress(null);
    setPanel('fields');
    focusHeading();
  }
  function update(section: string, id: string, value: string) {
    if (!writable) return;
    setPage(
      (p) =>
        p && {
          ...p,
          sections: p.sections.map((s) =>
            s.id === section
              ? { ...s, fields: s.fields.map((f) => (f.id === id ? { ...f, value } : f)) }
              : s,
          ),
        },
    );
    setMessage('');
  }
  function appendSection() {
    if (!page || !writable || !page.sections.some((s) => s.id === 'landing-cover')) return;
    const body = page.sections.find((s) => s.id === 'landing-body');
    if (!body) return;
    const id = 'landing-body-' + crypto.randomUUID();
    const occupied = new Set(page.sections.map((s) => s.label));
    let number = 2;
    while (occupied.has('Розділ ' + number)) number++;
    const section = {
      ...body,
      id,
      label: 'Розділ ' + number,
      fields: body.fields.map((f) => ({ ...f, value: '' })),
    };
    setPage({ ...page, sections: [...page.sections, section] });
    setSectionId(id);
    setMessage('Розділ додано до сторінки');
  }
  function removeSection() {
    if (
      !page ||
      !writable ||
      !sectionId.startsWith('landing-body-') ||
      !window.confirm('Видалити цей розділ із чернетки?')
    )
      return;
    setPage({ ...page, sections: page.sections.filter((s) => s.id !== sectionId) });
    setSectionId('landing-body');
    setMessage('Розділ вилучено');
  }
  function upload(section: string, id: string, file: File) {
    if (writable)
      void perform('upload', async () => {
        const { url } = await uploadEditorImage(file);
        update(section, id, url);
        setMessage('Зображення замінено. Збережіть чернетку');
      });
  }
  function chooseCanvasImage(field: PreviewField) {
    if (!writable || lock.current || !page || !imagePicker.current) return;
    setSectionId(field.sectionId);
    imageTarget.current = { ...field, path: page.path };
    imagePicker.current.value = '';
    imagePicker.current.click();
  }
  function replaceCanvasImage(file?: File) {
    const target = imageTarget.current;
    imageTarget.current = null;
    if (file && target && target.path === page?.path)
      upload(target.sectionId, target.fieldId, file);
  }
  function save(action: 'save' | 'publish') {
    if (
      !page ||
      !record ||
      !writable ||
      conflict ||
      (action === 'publish' && (dirty || !record.hasDraft))
    )
      return;
    void perform(action, async () => {
      accept(await writeEditorPage({ action, page, revision: record.revision }));
      setMessage(action === 'save' ? 'Чернетку збережено' : 'Зміни опубліковано на сайті');
    });
  }
  function create(values: NewPageValues) {
    if (writable)
      void perform('create', async () => {
        accept(await writeEditorPage({ action: 'create', ...values }));
        setMessage('Сторінку створено як чернетку');
        setPanel('fields');
        focusHeading();
      });
  }
  return {
    pages,
    record,
    page,
    task,
    sectionId,
    setSectionId,
    panel,
    setPanel,
    previewKey,
    query,
    setQuery,
    error,
    message,
    conflict,
    dirty,
    creating,
    setCreating,
    heading,
    library,
    open,
    update,
    upload,
    imagePicker,
    chooseCanvasImage,
    replaceCanvasImage,
    save,
    create,
    appendSection,
    removeSection,
  };
}
