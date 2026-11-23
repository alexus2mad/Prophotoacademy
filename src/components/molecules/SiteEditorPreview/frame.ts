import { nativeTypographyRules } from '@/lib/site-editor/text-presentation';
import type { SiteField, SitePage } from '@/lib/site-editor/types';
import { bindPreviewFields } from './match';
import { editCanvasText } from './text-control';
import { placementStyles } from './placement-styles';
import type { CanvasTarget, PreviewField, SiteEditorPreviewProps } from './types';

const frameStyles = `
  [data-canvas-field] { pointer-events: auto !important; }
  [data-canvas-field="image"] { cursor: pointer; }
  [data-canvas-field="text"], [data-canvas-field="multiline"] { cursor: text; }
  [data-canvas-field]:hover, [data-canvas-field]:focus-visible, [data-canvas-typing] {
    outline: 2px solid #e94239 !important; outline-offset: 2px;
  }
  [data-canvas-field]:empty:not([data-placeholder])::before { content: "\\00a0"; }
  [data-canvas-typing] {
    color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important;
  }
  [data-canvas-typing]:empty::before { visibility:hidden; }
  textarea[data-canvas-input] {
    position: fixed !important; z-index: 2147483647; box-sizing: border-box; display: block;
    max-width: none; min-width: 0; min-height: 0; max-height: none; margin: 0;
    resize: none; appearance: none; background: transparent; border-style: solid; border-color: transparent;
    border-radius: 0; outline: 0; box-shadow: none; overflow: hidden; overflow-wrap: break-word;
  }
`;

function pageFields(page: SitePage) {
  return new Map(
    page.sections.map((section) => [
      section.id,
      new Map(section.fields.map((field) => [field.id, field])),
    ]),
  );
}

function restoreAttribute(element: Element, name: string) {
  const original = element.getAttribute(name);
  return () => {
    if (original === null) element.removeAttribute(name);
    else element.setAttribute(name, original);
  };
}

function imageSources(element: HTMLElement) {
  return Array.from(element.closest('picture')?.querySelectorAll('source') ?? []);
}

function createTarget(
  element: HTMLElement,
  field: PreviewField,
  original: SiteField,
): CanvasTarget {
  const originalText = element.textContent;
  const restoreImage =
    original.kind === 'image'
      ? [
          restoreAttribute(element, 'src'),
          ...[element, ...imageSources(element)].map((item) => restoreAttribute(item, 'srcset')),
        ]
      : [];
  return {
    element,
    field,
    original,
    shown: original.value,
    restore() {
      if (original.kind === 'image') restoreImage.forEach((restore) => restore());
      else element.textContent = originalText;
    },
  };
}

function display(target: CanvasTarget, value: string) {
  if (target.shown === value) return;
  target.shown = value;
  if (value === target.original.value) target.restore();
  else if (target.original.kind !== 'image') target.element.textContent = value;
  else {
    const image = target.element;
    // A responsive source or the Next image optimizer would otherwise keep displaying the old asset.
    for (const source of [image, ...imageSources(image)]) source.removeAttribute('srcset');
    if (value) image.setAttribute('src', value);
    else image.removeAttribute('src');
  }
}

export function connectPreviewFrame(
  doc: Document,
  getProps: () => SiteEditorPreviewProps,
  select: (field: PreviewField) => void,
) {
  const style = doc.createElement('style');
  style.textContent = frameStyles + placementStyles;
  doc.head.append(style);
  // Saved styles came from SSR. Replace the sheet so resetting a field also resets its preview.
  for (const sheet of doc.querySelectorAll('style[data-site-typography]')) sheet.remove();
  const typography = doc.createElement('style');
  doc.head.append(typography);
  const view = doc.defaultView!;
  const events = new AbortController();
  const capture = { capture: true, signal: events.signal };
  const targets = new Map<HTMLElement, CanvasTarget>();
  let restoreControls: (() => void)[] = [];
  let closeText: (() => void) | undefined;
  let boundWidth = -1;
  let lastEditable: boolean | undefined;
  let currentFields = pageFields(getProps().page);

  function clearTargets() {
    closeText?.();
    restoreControls.forEach((restore) => restore());
    restoreControls = [];
    for (const target of targets.values()) {
      target.element.removeAttribute('data-canvas-field');
      target.element.removeAttribute('data-styled-field');
      if (target.shown !== target.original.value) target.restore();
    }
    targets.clear();
  }

  function sync() {
    const { editable, savedPage, page } = getProps();
    if (lastEditable !== editable || boundWidth !== view.innerWidth) {
      clearTargets();
      boundWidth = view.innerWidth;
      lastEditable = editable;
      const saved = pageFields(savedPage);
      for (const [element, field] of bindPreviewFields(doc, savedPage)) {
        const original = saved.get(field.sectionId)?.get(field.fieldId);
        if (!original) continue;
        element.dataset.styledField = field.sectionId + '/' + field.fieldId;
        targets.set(element, createTarget(element, field, original));
        if (!editable) continue;
        restoreControls.push(
          restoreAttribute(element, 'tabindex'),
          restoreAttribute(element, 'aria-description'),
        );
        element.tabIndex = 0;
        element.dataset.canvasField = original.kind;
        if (original.kind === 'image') {
          const visual = element.closest('[data-hero-visual][aria-hidden="true"]');
          if (visual) {
            restoreControls.push(restoreAttribute(visual, 'aria-hidden'));
            visual.removeAttribute('aria-hidden');
          }
          restoreControls.push(
            restoreAttribute(element, 'role'),
            restoreAttribute(element, 'aria-label'),
          );
          element.setAttribute('role', 'button');
          element.setAttribute('aria-label', 'Замінити зображення · ' + original.label);
        } else element.setAttribute('aria-description', 'Редагувати текст · ' + original.label);
      }
    }
    const css = nativeTypographyRules(page.sections);
    if (typography.textContent !== css) typography.textContent = css;
    currentFields = pageFields(page);
    for (const target of targets.values()) {
      const value = currentFields.get(target.field.sectionId)?.get(target.field.fieldId)?.value;
      if (value !== undefined) display(target, value);
    }
  }

  function targetFor(element: Element | null) {
    const bound = element?.closest<HTMLElement>('[data-canvas-field]');
    if (!bound) return;
    const original = targets.get(bound);
    if (original) return original;
    const sectionId = bound.closest<HTMLElement>('[data-block-type]')?.dataset.siteSection;
    const fieldId = bound.dataset.siteField;
    if (!sectionId || !fieldId) return;
    const field = currentFields.get(sectionId)?.get(fieldId);
    if (field) return createTarget(bound, { sectionId, fieldId }, field);
  }

  function activate(target: CanvasTarget, pointer?: MouseEvent) {
    const field = currentFields.get(target.field.sectionId)?.get(target.field.fieldId);
    if (!field || !getProps().editable) return;
    closeText?.();
    select(target.field);
    if (field.kind === 'image') {
      target.element.focus({ preventScroll: true });
      getProps().onReplaceImage(target.field);
    } else {
      closeText = editCanvasText(
        target.element,
        field,
        (value) => {
          if (!target.element.closest('[data-block-type]')) display(target, value);
          getProps().onChange(target.field, value);
        },
        pointer,
      );
    }
  }

  doc.addEventListener(
    'click',
    (event) => {
      const element = event.target as Element | null;
      if (!element?.closest || element.closest('[data-canvas-input]')) return;
      let target = targetFor(element);
      // Some promotional cards put a transparent action over both their copy and image.
      // Keep hit testing inside that card so a header link never activates content behind it.
      const action = element.closest<HTMLElement>('a[href],button');
      const card = action?.closest('article,figure,[data-card-motion]');
      if (
        !target &&
        action &&
        card &&
        view.getComputedStyle(action).position === 'absolute' &&
        event.detail &&
        getProps().editable
      ) {
        for (const hit of doc.elementsFromPoint(event.clientX, event.clientY)) {
          if (hit === element || !card.contains(hit)) continue;
          target = targetFor(hit);
          if (target) break;
        }
      }
      if (target || element.closest('a[href],button[type=submit],input[type=submit]')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      if (target) activate(target, event);
    },
    capture,
  );
  doc.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = targetFor(event.target as Element | null);
      if (!target || !getProps().editable) return;
      event.preventDefault();
      activate(target);
    },
    capture,
  );
  doc.addEventListener(
    'auxclick',
    (event) => {
      if ((event.target as Element | null)?.closest?.('a[href]')) event.preventDefault();
    },
    capture,
  );
  doc.addEventListener('submit', (event) => event.preventDefault(), capture);
  view.addEventListener('resize', sync, { signal: events.signal });
  sync();
  return {
    sync,
    scrollToSection(id: string) {
      const block = Array.from(doc.querySelectorAll<HTMLElement>('[data-block-type]')).find(
        (element) => element.dataset.siteSection === id,
      );
      if (block) {
        view.scrollTo({
          top: block.getBoundingClientRect().top + view.scrollY - 60,
          behavior: 'instant',
        });
        return;
      }
      for (const { element, field } of targets.values()) {
        if (field.sectionId !== id || !element.getClientRects().length) continue;
        view.scrollTo({
          top: element.getBoundingClientRect().top + view.scrollY - 80,
          behavior: 'instant',
        });
        return;
      }
    },
    disconnect() {
      events.abort();
      clearTargets();
      style.remove();
      typography.remove();
    },
  };
}
