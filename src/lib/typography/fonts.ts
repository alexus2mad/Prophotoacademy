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

export const studioSansFont = localFont({
  src: [
    { path: '../../app/fonts/studio-kyivtype-300.woff2', weight: '200 300', style: 'normal' },
    { path: '../../app/fonts/studio-kyivtype-400.woff2', weight: '350 400', style: 'normal' },
    { path: '../../app/fonts/studio-kyivtype-500.woff2', weight: '500', style: 'normal' },
    { path: '../../app/fonts/studio-kyivtype-700.woff2', weight: '700', style: 'normal' },
    { path: '../../app/fonts/studio-kyivtype-900.woff2', weight: '900 1000', style: 'normal' },
  ],
  variable: '--font-studio-sans',
  display: 'swap',
  adjustFontFallback: false,
});

export const studioCondensedFont = localFont({
  src: '../../app/fonts/studio-roboto-condensed.ttf',
  variable: '--font-studio-condensed',
  weight: '100 900',
  display: 'swap',
  adjustFontFallback: false,
});

export const studioHandFont = localFont({
  src: '../../app/fonts/studio-marck-script.ttf',
  variable: '--font-studio-hand',
  weight: '400',
  display: 'swap',
  adjustFontFallback: false,
});

export const studioThemeClassName = `academy-studio ${studioSansFont.variable} ${studioCondensedFont.variable} ${studioHandFont.variable}`;
