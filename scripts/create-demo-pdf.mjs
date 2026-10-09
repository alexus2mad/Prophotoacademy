import { mkdir, writeFile } from 'node:fs/promises';
// Synthetic, text-accessible fixture. No paid lesson content is exported.
const lines = [
  [
    'PROPHOTO / LEARNING PREVIEW',
    'CONTENT PLAN',
    'This is a demonstration workbook, not a paid lesson.',
    '1. Choose one person you want to reach.',
    '2. Write one useful idea for that person.',
    '3. Choose a photograph that supports the idea.',
  ],
  [
    'PROPHOTO / LEARNING PREVIEW',
    'YOUR NEXT STEP',
    'Use this page to test the PDF reader.',
    'Reading each page saves progress in this browser.',
    'Downloading alone does not complete a lesson.',
    'You can confirm offline study below the lesson.',
  ],
];
const escape = (value) => value.replace(/[()\\]/g, '\\$&');
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>',
];
for (let i = 0; i < 2; i++) {
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 7 0 R >> >> /Contents ${4 + i * 2} 0 R >>`,
  );
  const stream =
    'BT /F1 16 Tf 48 770 Td 32 TL ' +
    lines[i].map((line, n) => (n ? 'T* ' : '') + '(' + escape(line) + ') Tj').join('\n') +
    ' ET';
  objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
}
objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
let pdf = '%PDF-1.4\n',
  offsets = [0];
objects.forEach((value, i) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${i + 1} 0 obj\n${value}\nendobj\n`;
});
const start = Buffer.byteLength(pdf);
pdf +=
  `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
  offsets
    .slice(1)
    .map((offset) => String(offset).padStart(10, '0') + ' 00000 n \n')
    .join('') +
  `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
await mkdir(new URL('../public/demo-media/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/demo-media/workbook.pdf', import.meta.url), pdf);
