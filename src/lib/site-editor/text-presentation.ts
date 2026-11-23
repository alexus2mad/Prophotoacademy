import type { CSSProperties } from 'react';
import type { SiteSection, TextStyle } from './types';

const fonts = {
  body: 'var(--font-studio-sans), Arial, sans-serif',
  heading: 'var(--font-studio-condensed), Arial, sans-serif',
  editorial: 'var(--font-studio-hand), cursive',
};
const sizes = {
  small: '0.9375rem',
  medium: '1.125rem',
  large: 'clamp(1.5rem, 3vw, 2.25rem)',
  display: 'clamp(2.25rem, 5vw, 4.5rem)',
};
const colors = { ink: '#110b09', muted: '#655e5b', accent: '#c6302a', light: '#fafafa' };
const weights = { normal: 400, bold: 700 };
const alignments = { start: 'start', center: 'center', end: 'end' } as const;

export function fieldTypography(style?: TextStyle): CSSProperties {
  return {
    ...(style?.font && { fontFamily: fonts[style.font] }),
    ...(style?.size && { fontSize: sizes[style.size] }),
    ...(style?.color && { color: colors[style.color] }),
    ...(style?.weight && { fontWeight: weights[style.weight] }),
    ...(style?.align && { textAlign: alignments[style.align] }),
  };
}

export function nativeTypographyRules(sections: SiteSection[], within?: string) {
  const ident = /^[\w-]+$/;
  const rules: string[] = [];
  for (const section of sections) {
    if (section.blockType || !ident.test(section.id)) continue;
    for (const field of section.fields) {
      if (!field.style || !ident.test(field.id)) continue;
      const declarations = Object.entries(fieldTypography(field.style))
        .filter(([, value]) => value !== undefined)
        .map(
          ([key, value]) =>
            key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + ':' + value + '!important',
        );
      if (!declarations.length) continue;
      const scope = '[data-site-section="' + section.id + '"]';
      const name =
        ':is([data-site-field="' + field.id + '"],[data-site-paragraph="' + field.id + '"])';
      const resolved = '[data-styled-field="' + section.id + '/' + field.id + '"]';
      const homepage = within === 'homepage';
      const prefix = within && !homepage && ident.test(within) ? '#' + within + ' ' : '';
      const descendant =
        scope + ' ' + name + ':not([data-site-section]):not(' + scope + ' [data-site-section] *)';
      const selectors = [descendant, scope + name, resolved].map(
        (selector) =>
          prefix + selector + (homepage ? ':not(#home-panel-studio *,#home-panel-shop *)' : ''),
      );
      rules.push(selectors.join(',') + '{' + declarations.join(';') + '}');
    }
  }
  return rules.join('\n');
}
