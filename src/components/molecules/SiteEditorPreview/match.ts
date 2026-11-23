import type { SitePage, SiteField } from '@/lib/site-editor/types';
import type { PreviewField, PreviewFieldCandidates } from './types';

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim().toLocaleLowerCase('uk');
const ignore =
  '[data-site-composition],script,style,noscript,template,form,dialog,time,svg,[hidden],[inert],[data-site-locked],[data-hero-visual][data-active="false"],a[href^="/checkout"]';

function imageUrl(src: string, base: string) {
  if (!src) return '';
  try {
    const url = new URL(src, base);
    const original = url.pathname.endsWith('/_next/image') && url.searchParams.get('url');
    return original ? new URL(original, base).href : url.href;
  } catch {
    return '';
  }
}

function fieldValue(field: SiteField, base: string) {
  return field.kind === 'image' ? imageUrl(field.value, base) : normalize(field.value);
}

export function previewIndex(page: SitePage, base: string) {
  const index = new Map<string, PreviewField[]>();
  for (const section of page.sections) {
    if (section.blockType) continue;
    for (const field of section.fields) {
      if (/(^|-)alt($|-)/.test(field.id)) continue;
      const value = fieldValue(field, base);
      if (!value) continue;
      const entry = { sectionId: section.id, fieldId: field.id };
      const matches = index.get(value);
      if (matches) matches.push(entry);
      else index.set(value, [entry]);
    }
  }
  return index;
}

function scopeOf(node: HTMLElement) {
  return node.closest<HTMLElement>('[data-site-section]')?.dataset.siteSection;
}

function sourceFor(img: HTMLImageElement) {
  const view = img.ownerDocument.defaultView;
  return Array.from(img.closest('picture')?.querySelectorAll('source') ?? []).find(
    (source) => !source.media || view?.matchMedia?.(source.media).matches,
  );
}

// Make a plain text run in a mixed heading/button editable without replacing its other
// words, styled spans or icons. This DOM exists only inside the script-disabled admin frame.
function textTarget(node: Text) {
  const parent = node.parentElement!;
  if (!parent.children.length && parent.textContent === node.data) return parent;
  // A neutral custom element avoids public selectors for decorative heading spans.
  const run = node.ownerDocument.createElement('site-edit-run');
  const text = node.data;
  const leading = text.slice(0, text.length - text.trimStart().length);
  const trailing = text.slice(text.trimEnd().length);
  node.replaceWith(leading, run, trailing);
  run.textContent = text.trim();
  return run;
}

export function bindPreviewFields(doc: Document, savedPage: SitePage) {
  const targets = new Map<HTMLElement, PreviewField>();
  const main = doc.querySelector('main');
  if (!main) return targets;
  const index = previewIndex(savedPage, doc.baseURI);
  const fields = new Map(
    savedPage.sections.map((section) => [
      section.id,
      new Map(section.fields.map((f) => [f.id, f])),
    ]),
  );

  const inferred = new Map<string, PreviewFieldCandidates>();
  const identified = new Set<string>();

  function accept(node: HTMLElement | Text, field: PreviewField, explicit?: string) {
    const key = field.sectionId + '/' + field.fieldId;
    if (explicit) {
      identified.add(key);
      const element = node.nodeType === 3 ? textTarget(node as Text) : (node as HTMLElement);
      // Preserve an authored marker if the original text run inside a button/heading needed a wrapper.
      if (element.localName === 'site-edit-run') element.dataset.siteField = field.fieldId;
      targets.set(element, field);
      return;
    }
    const candidate = inferred.get(key);
    if (candidate) candidate.nodes.push(node);
    else inferred.set(key, { field, nodes: [node] });
  }

  function resolve(node: HTMLElement, value: string, isImage: boolean, explicit?: string) {
    if (node.closest(ignore)) return;
    const sectionId = scopeOf(node);
    const field = sectionId && explicit ? fields.get(sectionId)?.get(explicit) : undefined;
    if (explicit) {
      if (!sectionId || !field || (field.kind === 'image') !== isImage) return;
      if (isImage || fieldValue(field, doc.baseURI) === value)
        return { sectionId, fieldId: field.id };
      return;
    }
    // Navigation labels and unbound functional controls can share copy with the page.
    if (node.closest('nav,[role=navigation]') || (!sectionId && node.closest('a,button,summary')))
      return;
    const matches = (index.get(value) || []).filter(
      (entry) =>
        (!sectionId || entry.sectionId === sectionId) &&
        (fields.get(entry.sectionId)?.get(entry.fieldId)?.kind === 'image') === isImage,
    );
    if (matches.length === 1) return matches[0];
  }

  for (const img of main.querySelectorAll('img')) {
    const source = sourceFor(img);
    const sourceURL = source?.getAttribute('srcset')?.trim().split(/\s+/)[0];
    const value = imageUrl(
      sourceURL || img.dataset.siteImageSource || img.currentSrc || img.src,
      doc.baseURI,
    );
    const explicit = source?.dataset.siteField || img.dataset.siteField;
    const match = resolve(img, value, true, explicit);
    if (match) accept(img, match, explicit);
  }

  // Authored landing prose is one field rendered as semantic paragraphs. Coalesce it
  // inside the preview only so typing in a later paragraph cannot drop the earlier ones.
  for (const paragraph of main.querySelectorAll<HTMLElement>('p[data-site-paragraph]')) {
    if (!paragraph.isConnected) continue;
    const fieldId = paragraph.dataset.siteParagraph!;
    const section = fields.get(scopeOf(paragraph) || '');
    const field = section?.get(fieldId);
    if (field?.kind !== 'multiline') continue;
    const siblings: Element[] = [paragraph];
    let next = paragraph.nextElementSibling;
    while (next?.getAttribute('data-site-paragraph') === fieldId) {
      siblings.push(next);
      next = next.nextElementSibling;
    }
    if (normalize(siblings.map((p) => p.textContent).join(' ')) !== normalize(field.value))
      continue;
    if (siblings.length > 1) {
      paragraph.textContent = field.value;
      for (const rest of siblings.slice(1)) rest.remove();
    }
    paragraph.dataset.siteField = fieldId;
  }
  // One logical field can include a bold phrase in the middle of the sentence.
  for (const run of main.querySelectorAll<HTMLElement>(
    '[data-site-field] > [data-site-emphasis]',
  )) {
    const fieldId = run.parentElement?.dataset.siteField;
    const match = resolve(run, normalize(run.textContent ?? ''), false, fieldId);
    if (match) accept(run, match, fieldId);
  }
  const walker = doc.createTreeWalker(main, 4 /* NodeFilter.SHOW_TEXT */);
  const runs: Text[] = [];
  while (walker.nextNode()) runs.push(walker.currentNode as Text);
  for (const run of runs) {
    const node = run.parentElement;
    const value = normalize(run.data);
    if (!node || !value || node.closest('[aria-hidden=true]')) continue;
    const field = resolve(node, value, false, node.dataset.siteField);
    if (field) accept(run, field, node.dataset.siteField);
  }
  // A unique stored value may still occur in several unrelated places on the rendered page.
  // Infer ownership only for a single unmarked occurrence. Explicitly marked copies can all edit the same field.
  for (const [key, { field, nodes }] of inferred) {
    if (identified.has(key) || nodes.length !== 1) continue;
    const node = nodes[0];
    targets.set(node.nodeType === 3 ? textTarget(node as Text) : (node as HTMLElement), field);
  }
  return targets;
}
