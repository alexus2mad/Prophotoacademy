import { assetHref } from './selectors';
export async function pdfLibrary() {
  const pdf = await import('pdfjs-dist');
  pdf.GlobalWorkerOptions.workerSrc = assetHref('/learning/pdf.worker.min.mjs');
  return pdf;
}
export const readingActive = () => document.visibilityState === 'visible' && document.hasFocus();
export function mostVisibleReadingBlock() {
  return [...document.querySelectorAll<HTMLElement>('[data-reading-block]')]
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        element,
        visible: Math.max(0, Math.min(rect.bottom, innerHeight - 76) - Math.max(rect.top, 80)),
      };
    })
    .sort((a, b) => b.visible - a.visible)[0];
}
