'use client';
import { useEffect, useRef, useState } from 'react';
import { useBlockComposition } from '@/components/organisms/SiteBlockInspector/hooks';
import type { EditorPage, SitePage, SiteField, TextStyle } from '@/lib/site-editor/types';
import type { PreviewField } from '@/components/molecules/SiteEditorPreview/types';
import { EditorRequestError, fetchEditorPage, writeEditorPage } from './requests';
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

export function useSiteContentEditor({ initialPages, writable, sync }: SiteContentEditorProps) {
  const [pages, setPages] = useState(initialPages);
  // null: closed; '' : open; a path: handed over from the staging editor.
  const [syncTarget, setSyncTarget] = useState<string | null>(null);
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
  const [imageTarget, setImageTarget] = useState<CanvasImageTarget | null>(null);
  const [fieldId, setFieldId] = useState('');
  const dirty = !!page && !!record && JSON.stringify(page) !== JSON.stringify(record.page);

  function selectField(id: string, field = '', focus = false) {
    setSectionId(id);
    setFieldId(field);
    if (focus) {
      setPanel('fields');
      requestAnimationFrame(() => document.getElementById('editor-field-' + field)?.focus());
    }
  }
  const blocks = useBlockComposition({
    page,
    sectionId,
    disabled: !writable || !!task || conflict,
    onChange: setPage,
    onSelect: selectField,
    onMessage: setMessage,
  });
  function remember(result: EditorPage) {
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
  }
  function openSync(path = '') {
    if (lock.current) return;
    setError('');
    setMessage('');
    setCreating(false);
    setSyncTarget(path);
  }
  function closeSync() {
    setSyncTarget(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('sync');
    window.history.replaceState(window.history.state, '', url);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function accept(result: EditorPage) {
    setImageTarget(null);
    blocks.closeLibrary();
    setRecord(result);
    setPage(result.page);
    setSectionId((id) =>
      result.page.sections.some((s) => s.id === id) ? id : (result.page.sections[0]?.id ?? ''),
    );
    remember(result);
    setAddress(result.page.path);
    setCreating(false);
    setConflict(false);
    setPreviewKey((n) => n + 1);
  }

  useEffect(() => {
    const handed = new URL(window.location.href).searchParams.get('sync');
    if (sync === 'production' && handed?.startsWith('/')) setSyncTarget(handed);
  }, [sync]);

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
    setImageTarget(null);
    setFieldId('');
    blocks.closeLibrary();
    setError('');
    setMessage('');
    setConflict(false);
    setCreating(false);
    setAddress(null);
    setPanel('fields');
    focusHeading();
  }
  function updateField(section: string, id: string, change: (field: SiteField) => SiteField) {
    if (!writable || lock.current || conflict) return;
    setPage(
      (p) =>
        p && {
          ...p,
          sections: p.sections.map((s) =>
            s.id === section
              ? { ...s, fields: s.fields.map((f) => (f.id === id ? change(f) : f)) }
              : s,
          ),
        },
    );
    setMessage('');
  }
  function update(section: string, id: string, value: string) {
    updateField(section, id, (field) => ({ ...field, value }));
  }
  function updateStyle(section: string, id: string, style?: TextStyle) {
    updateField(section, id, (field) => ({ ...field, style }));
  }
  function selectOffer(id: string) {
    if (!writable || lock.current || conflict) return;
    setPage((current) => current && { ...current, offerId: id || undefined });
    setMessage('');
  }
  function chooseImage(field: PreviewField) {
    if (!writable || lock.current || conflict || !page) return;
    selectField(field.sectionId, field.fieldId);
    setImageTarget({ ...field, path: page.path });
  }
  function applyImage(url: string) {
    if (
      imageTarget &&
      page?.path === imageTarget.path &&
      page.sections.some(
        (s) =>
          s.id === imageTarget.sectionId &&
          s.fields.some((f) => f.id === imageTarget.fieldId && f.kind === 'image'),
      )
    ) {
      update(imageTarget.sectionId, imageTarget.fieldId, url);
      setMessage('Зображення обрано. Збережіть чернетку');
    }
    setImageTarget(null);
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
    selectField,
    fieldId,
    setFieldId,
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
    updateStyle,
    selectOffer,
    imageTarget,
    setImageTarget,
    chooseImage,
    applyImage,
    blocks,
    save,
    create,
    syncTarget,
    openSync,
    closeSync,
    remember,
  };
}
