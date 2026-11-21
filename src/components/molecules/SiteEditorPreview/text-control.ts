import type { SiteField } from '@/lib/site-editor/types';

const typography = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-stretch',
  'font-variation-settings',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'word-spacing',
  'direction',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
];

function caretOffset(element: HTMLElement, pointer?: MouseEvent) {
  if (!pointer || !pointer.detail) return;
  const doc = element.ownerDocument;
  const where = doc.caretPositionFromPoint?.(pointer.clientX, pointer.clientY);
  const range = where ? undefined : doc.caretRangeFromPoint?.(pointer.clientX, pointer.clientY);
  const node = where?.offsetNode ?? range?.startContainer;
  if (node && element.contains(node)) return where?.offset ?? range?.startOffset;
}

export function textEditCommand(
  event: Pick<KeyboardEvent, 'key' | 'keyCode' | 'isComposing' | 'ctrlKey' | 'metaKey'>,
  singleLine: boolean,
) {
  if (event.isComposing || event.keyCode === 229) return;
  if (event.key === 'Escape') return 'cancel';
  if (event.key === 'Tab') return 'tab';
  if (event.key === 'Enter' && (singleLine || event.ctrlKey || event.metaKey)) return 'commit';
}

// A native plain-text control preserves IME, selection, clipboard and undo. The page
// element stays in its layout and determines the position and wrapping of the control.
export function editCanvasText(
  element: HTMLElement,
  field: SiteField,
  change: (value: string) => void,
  pointer?: MouseEvent,
) {
  const doc = element.ownerDocument;
  const view = doc.defaultView!;
  const offset = caretOffset(element, pointer) ?? field.value.length;
  const control = doc.createElement('textarea');
  const css = view.getComputedStyle(element);
  for (const property of typography)
    control.style.setProperty(property, css.getPropertyValue(property));
  control.style.color = css.color;
  control.setAttribute('data-canvas-input', '');
  control.setAttribute('aria-label', field.label);
  control.setAttribute('aria-multiline', String(field.kind === 'multiline'));
  control.maxLength = 50000;
  control.value = field.value;
  const singleLine = field.kind === 'text';
  const events = new AbortController();
  const options = { signal: events.signal };
  let closed = false;

  function place() {
    const box = element.getBoundingClientRect();
    control.style.left = box.left + 'px';
    control.style.top = box.top + 'px';
    control.style.width = Math.max(box.width, parseFloat(css.fontSize)) + 'px';
    control.style.height =
      Math.max(box.height, parseFloat(css.lineHeight) || parseFloat(css.fontSize) * 1.2) + 'px';
  }

  function close(refocus = false) {
    if (closed) return;
    closed = true;
    events.abort();
    observer.disconnect();
    element.removeAttribute('data-canvas-typing');
    control.remove();
    if (refocus) element.focus({ preventScroll: true });
  }

  const observer = new ResizeObserver(place);
  observer.observe(element);
  place();
  element.setAttribute('data-canvas-typing', '');
  doc.body.append(control);
  control.addEventListener(
    'input',
    () => {
      if (singleLine && control.value.includes('\n')) {
        const start = control.selectionStart;
        control.value = control.value.replace(/\n/g, ' ');
        control.setSelectionRange(start, start);
      }
      change(control.value);
    },
    options,
  );
  control.addEventListener(
    'keydown',
    (event) => {
      const command = textEditCommand(event, singleLine);
      if (!command) return;
      if (command !== 'tab') event.preventDefault();
      if (command === 'cancel') change(field.value);
      // On Tab the field is the starting point for the browser's normal focus order.
      close(true);
    },
    options,
  );
  control.addEventListener('blur', () => close(), options);
  doc.addEventListener('scroll', place, { capture: true, passive: true, ...options });
  view.addEventListener('resize', place, options);
  control.focus({ preventScroll: true });
  control.setSelectionRange(offset, offset);
  return close;
}
