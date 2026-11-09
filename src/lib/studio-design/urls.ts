/** Prefix same-origin public assets once when the review is hosted beneath a repository path. */
export function studioAssetUrl(src: string): string {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  if (
    !basePath ||
    !src.startsWith('/') ||
    src.startsWith('//') ||
    src === basePath ||
    src.startsWith(`${basePath}/`)
  )
    return src;
  return `${basePath}${src}`;
}
