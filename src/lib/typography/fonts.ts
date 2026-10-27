import localFont from 'next/font/local';

export const academyDisplayFont = localFont({
  src: [
    { path: '../../app/fonts/kyivtype-light.woff2', weight: '300', style: 'normal' },
    { path: '../../app/fonts/kyivtype-black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-home-display',
  display: 'swap',
});

export const academyTextFont = localFont({
  src: '../../app/fonts/inter-home-variable.woff2',
  variable: '--font-home-text',
  weight: '100 900',
  display: 'swap',
});

export const academyThemeClassName = `academy-theme ${academyDisplayFont.variable} ${academyTextFont.variable}`;

export const readingFont = localFont({
  src: [
    { path: '../../app/fonts/source-sans-3-upright.woff2', weight: '200 900', style: 'normal' },
    { path: '../../app/fonts/source-sans-3-italic.woff2', weight: '200 900', style: 'italic' },
  ],
  variable: '--font-reading',
  display: 'swap',
  preload: false,
  fallback: ['Arial', 'sans-serif'],
});
