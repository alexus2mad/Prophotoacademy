import type { EmailContent, RenderedEmail } from './types';

// Brand palette from design-system.css. Email clients need inline styles and tables;
// web fonts are a progressive enhancement over Arial.
const color = {
  canvas: '#101211',
  surface: '#191c1a',
  border: '#343b33',
  text: '#f2efe7',
  secondary: '#b6bbb3',
  muted: '#91988e',
  accent: '#d5e4b9',
};
const font = "Manrope, 'Segoe UI', Arial, Helvetica, sans-serif";
const display = "KyivType, Manrope, 'Segoe UI', Arial, Helvetica, sans-serif";
export const supportEmail = 'academyprophoto@gmail.com';

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

export function siteOrigin() {
  const value = process.env.NEXT_PUBLIC_ACADEMY_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return url.origin;
  } catch {}
  return 'https://prophotoacademy.com.ua';
}

export function renderEmail(content: EmailContent, origin = siteOrigin()): RenderedEmail {
  const e = escapeHtml;
  const paragraph = (text: string) =>
    `<p style="margin:0 0 16px;font-family:${font};font-size:16px;line-height:1.6;color:${color.secondary};">${e(text)}</p>`;
  const code = content.code
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:${color.canvas};border:1px solid ${color.border};border-radius:12px;padding:16px 24px;font-family:'Courier New',Courier,monospace;font-size:32px;line-height:1;letter-spacing:8px;font-weight:700;color:${color.text};">${e(content.code)}</td></tr></table>`
    : '';
  const details = content.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-top:1px solid ${color.border};">${content.details
        .map(
          (row) =>
            `<tr><td style="padding:12px 12px 12px 0;border-bottom:1px solid ${color.border};font-family:${font};font-size:14px;line-height:1.5;color:${color.muted};vertical-align:top;width:40%;">${e(row.label)}</td><td style="padding:12px 0;border-bottom:1px solid ${color.border};font-family:${font};font-size:14px;line-height:1.5;color:${color.text};vertical-align:top;">${e(row.value)}</td></tr>`,
        )
        .join('')}</table>`
    : '';
  const action = content.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;"><tr><td style="border-radius:999px;background:${color.accent};"><a href="${e(content.action.href)}" style="display:inline-block;padding:14px 28px;border-radius:999px;font-family:${font};font-size:15px;line-height:1.2;font-weight:600;color:${color.canvas};text-decoration:none;">${e(content.action.label)}</a></td></tr></table>`
    : '';
  const note = content.note
    ? `<p style="margin:24px 0 0;font-family:${font};font-size:13px;line-height:1.6;color:${color.muted};">${e(content.note)}</p>`
    : '';
  const html = `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${e(content.subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&amp;display=swap" rel="stylesheet">
<style>@font-face{font-family:KyivType;font-weight:400;src:url(${e(origin)}/email/kyivtype-regular.woff2) format('woff2');}</style>
</head>
<body style="margin:0;padding:0;background:${color.canvas};">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${e(content.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${color.canvas};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 4px 24px;"><a href="${e(origin)}" style="text-decoration:none;"><img src="${e(origin)}/brand/prophoto-study-email.png" width="150" height="38" alt="ProPhoto Study — академія фотографії" style="display:block;width:150px;height:auto;border:0;color:${color.text};font-family:${font};font-size:18px;"></a></td></tr>
<tr><td style="background:${color.surface};border:1px solid ${color.border};border-radius:16px;padding:36px 32px;">
<h1 style="margin:0 0 20px;font-family:${display};font-size:28px;line-height:1.15;font-weight:400;letter-spacing:-0.5px;color:${color.text};">${e(content.heading)}</h1>
${content.paragraphs.map(paragraph).join('\n')}
${code}${details}${action}${note}
</td></tr>
<tr><td style="padding:24px 4px 0;font-family:${font};font-size:12px;line-height:1.6;color:${color.muted};">
Pro Photo Academy · Київ<br>
Питання? Напишіть нам: <a href="mailto:${supportEmail}" style="color:${color.secondary};">${supportEmail}</a> · <a href="${e(origin)}" style="color:${color.secondary};">${e(new URL(origin).host)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  const text = [
    content.heading,
    '',
    ...content.paragraphs.flatMap((p) => [p, '']),
    ...(content.code ? [content.code, ''] : []),
    ...(content.details?.map((d) => `${d.label}: ${d.value}`) || []),
    ...(content.details?.length ? [''] : []),
    ...(content.action ? [`${content.action.label}: ${content.action.href}`, ''] : []),
    ...(content.note ? [content.note, ''] : []),
    '—',
    `Pro Photo Academy · ${new URL(origin).host}`,
    `Питання? ${supportEmail}`,
  ].join('\n');
  return { subject: content.subject, html, text };
}
