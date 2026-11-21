import type { SitePage, SiteField, SiteSection } from '@/lib/site-editor/types';
import type { PreviewField } from './types';

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim().toLocaleLowerCase('uk');

function imageUrl(src: string, origin: string) {
  if (!src) return '';
  try {
    const url = new URL(src, origin);
    if (url.pathname === '/_next/image' && url.searchParams.has('url')) {
      return new URL(url.searchParams.get('url')!, origin).href;
    }
    return url.href;
  } catch {
    return '';
  }
}

function elementValue(element: Element) {
  if (element.tagName !== 'IMG') return normalize(element.textContent ?? '');
  const src = element.getAttribute('src') || (element as HTMLImageElement).currentSrc;
  return imageUrl(src, element.ownerDocument.baseURI);
}

function fieldValue(field: SiteField, base: string) {
  return field.kind === 'image' ? imageUrl(field.value, base) : normalize(field.value);
}

export function previewIndex(page: SitePage, base: string) {
  const index = new Map<string, PreviewField[]>();
  for (const section of page.sections) {
    for (const field of section.fields) {
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

// Some captions and photographs appear in several sections. Open a field only when
// the clicked content identifies it unambiguously, or it is unique in the active section.
export function findPreviewField(
  element: Element,
  index: ReturnType<typeof previewIndex>,
  active: string,
) {
  for (
    let node: Element | null = element;
    node && node.tagName !== 'BODY';
    node = node.parentElement
  ) {
    const found = index.get(elementValue(node)) ?? [];
    if (found.length === 1) return found[0];
    const local = found.filter((field) => field.sectionId === active);
    if (local.length === 1) return local[0];
    if (node.matches('section,article,main,header,footer')) break;
  }
  return null;
}

export function scrollPreviewToSection(doc: Document, section: SiteSection) {
  const scope = doc.querySelector('main') ?? doc.body;
  const view = doc.defaultView;
  if (!view || !scope) return;
  const values = new Set(
    section.fields.map((field) => fieldValue(field, doc.baseURI)).filter(Boolean),
  );
  const candidates = scope.querySelectorAll('h1,h2,h3,h4,p,li,figcaption,summary,img');
  for (const element of candidates) {
    if (!values.has(elementValue(element))) continue;
    view.scrollTo({
      top: element.getBoundingClientRect().top + view.scrollY - 80,
      behavior: 'instant',
    });
    return;
  }
}
