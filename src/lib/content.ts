import 'server-only';
import { cache } from 'react';
import { draftMode } from 'next/headers';
import { loadSourceContent } from './content/source';

export const getContent = cache(async () =>
  loadSourceContent(process.env.CONTENT_MODE === 'sanity' && (await draftMode()).isEnabled),
);
export { findImage, findOffering } from './content/selectors';
