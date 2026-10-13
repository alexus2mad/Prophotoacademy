import { assetHref } from './selectors';
export async function pdfLibrary() {
  const pdf = await import('pdfjs-dist');
  pdf.GlobalWorkerOptions.workerSrc = assetHref('/learning/pdf.worker.min.mjs');
  return pdf;
}
