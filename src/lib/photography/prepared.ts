import manifest from './prepared-images.json';

export function preparedPhoto(source: string, basePath = process.env.NEXT_PUBLIC_BASE_PATH || '') {
  const localSource =
    basePath && source.startsWith(basePath + '/') ? source.slice(basePath.length) : source;
  if (!Object.hasOwn(manifest, localSource)) return null;
  const variants = manifest[localSource as keyof typeof manifest];
  if (!variants) return null;
  return {
    src: basePath + variants[variants.length - 1].src,
    srcSet: variants.map(({ src, width }) => basePath + src + ' ' + width + 'w').join(', '),
  };
}
