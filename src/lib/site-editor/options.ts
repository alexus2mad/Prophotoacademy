/** Sections a new practical intensive starts with, in page order. */
export const intensiveTemplateBlocks = [
  'intensive-intro',
  'intensive-program',
  'intensive-gallery',
  'intensive-format',
  'intensive-offer',
] as const;
// The announcement with prices is inserted from the library where the page needs it.
export const intensiveBlockTypes = [...intensiveTemplateBlocks, 'intensive-announcement'] as const;
export const blockTypes = [
  'heading',
  'paragraph',
  'image',
  'cards',
  'carousel',
  ...intensiveBlockTypes,
] as const;
export const pageTemplateIds = [
  'blank',
  'editorial',
  'course',
  'workshop',
  'workshop-intensive',
] as const;
export const textFonts = ['body', 'heading', 'editorial'] as const;
export const textSizes = ['small', 'medium', 'large', 'display'] as const;
export const textColors = ['ink', 'muted', 'accent', 'light'] as const;
export const textAlignments = ['start', 'center', 'end'] as const;
export const textWeights = ['normal', 'bold'] as const;
