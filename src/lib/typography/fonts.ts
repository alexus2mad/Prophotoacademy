import localFont from 'next/font/local';

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
