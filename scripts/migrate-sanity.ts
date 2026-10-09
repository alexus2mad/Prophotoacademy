import type { SourceImage, MigrationDocument } from './types';
import './environment';
import { createClient } from '@sanity/client';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import seed from '../content/academy.json';
const write = process.argv.includes('--write');
const source = { system: 'webflow', siteId: '694a5cc146bb9192fcdbb5ac', capturedAt: '2026-10-07' };
const ref = (id: string) => ({ _type: 'reference', _ref: id });
const keyed = (items: unknown[]) =>
  items.map((value, i) =>
    typeof value === 'object' && value !== null ? { ...value, _key: `item-${i}` } : value,
  );
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (write && (!projectId || !token))
  throw new Error('--write requires a Sanity project ID and write token');
const client = projectId
  ? createClient({ projectId, dataset, token, apiVersion: '2026-10-01', useCdn: false })
  : undefined;
const docs: Record<string, unknown>[] = [];
const assetHashes: Record<string, string> = {};
for (const image of seed.images) {
  const bytes = await readFile(`public${image.src}`);
  const hash = createHash('sha1').update(bytes).digest('hex');
  let assetId = assetHashes[hash] || `image-${hash}-${image.width}x${image.height}-webp`;
  if (write) {
    const existing = await client!.fetch<string | undefined>(
      '*[_type == "sanity.imageAsset" && sha1 == $hash][0]._id',
      { hash },
    );
    assetId =
      existing ||
      (
        await client!.assets.upload('image', bytes, {
          filename: `${image.id}.webp`,
          source: {
            id: image.driveId || image.id,
            name: image.driveId ? 'Google Drive' : 'ProPhoto Hub',
            url: image.driveId
              ? `https://drive.google.com/file/d/${image.driveId}/view`
              : (image as SourceImage).sourceUrl,
          },
        })
      )._id;
  }
  assetHashes[hash] = assetId;
  const {
    src,
    width,
    height,
    bytes: _,
    originalWidth,
    originalHeight,
    ...metadata
  } = image as SourceImage;
  docs.push({
    ...metadata,
    _id: `image-${image.id}`,
    _type: 'editorialImage',
    legacyId: image.id,
    image: { _type: 'image', asset: ref(assetId) },
    source: image.driveId ? source : { system: 'wix', capturedAt: '2026-10-07' },
  });
}
for (const [i, work] of seed.works.entries()) {
  const { imageId, ...data } = work;
  docs.push({
    ...data,
    _id: work.id,
    _type: 'studentWork',
    legacyId: work.id,
    image: ref(`image-${imageId}`),
    sortOrder: i,
    source,
  });
}
for (const instructor of seed.instructors) {
  const { imageId, ...data } = instructor;
  docs.push({
    ...data,
    _id: `instructor-${instructor.id}`,
    _type: 'instructor',
    legacyId: instructor.id,
    image: ref(`image-${imageId}`),
    source,
  });
}
for (const [i, program] of seed.programs.entries()) {
  const { imageId, instructorIds, workIds, slug, ...data } = program;
  docs.push({
    ...data,
    _id: program.id,
    _type: 'program',
    legacyId: program.id,
    slug: { _type: 'slug', current: slug },
    image: ref(`image-${imageId}`),
    instructors: keyed(instructorIds.map((id) => ref(`instructor-${id}`))),
    works: keyed(workIds.map(ref)),
    modules: keyed(program.modules),
    faqs: keyed(program.faqs),
    sortOrder: i,
    source,
  });
}
for (const offering of seed.offerings) {
  const { programId, ...data } = offering;
  docs.push({
    ...data,
    _id: offering.id,
    _type: 'offering',
    legacyId: offering.id,
    program: ref(programId),
    packages: keyed(offering.packages),
    source,
  });
}
for (const [i, t] of seed.testimonials.entries())
  docs.push({ ...t, _id: t.id, _type: 'testimonial', legacyId: t.id, sortOrder: i, source });
for (const page of seed.pages)
  docs.push({
    ...page,
    _id: page.id,
    _type: 'editorialPage',
    legacyId: page.id,
    slug: { _type: 'slug', current: page.slug },
    source,
  });
const { heroImageId, primaryProgramId, ...settings } = seed.settings;
docs.push({
  ...settings,
  _id: 'site-settings',
  _type: 'siteSettings',
  heroImage: ref(`image-${heroImageId}`),
  ...(primaryProgramId ? { primaryProgram: ref(primaryProgramId) } : {}),
  source,
});
for (const [i, room] of seed.rooms.entries()) {
  const { imageId, galleryImageIds, slug, ...data } = room;
  docs.push({
    ...data,
    _id: room.id,
    _type: 'studioRoom',
    legacyId: room.id,
    slug: { _type: 'slug', current: slug },
    image: ref(`image-${imageId}`),
    gallery: keyed(galleryImageIds.map((id) => ref(`image-${id}`))),
    sortOrder: i,
    source: { system: 'wix', capturedAt: '2026-10-07' },
  });
}
for (const session of seed.practiceSessions) {
  const { imageId, roomId, programIds, slug, ...data } = session;
  docs.push({
    ...data,
    _id: session.id,
    _type: 'practiceSession',
    legacyId: session.id,
    slug: { _type: 'slug', current: slug },
    image: ref(`image-${imageId}`),
    room: ref(roomId),
    programs: keyed(programIds.map(ref)),
    source: { system: 'editorial-plan', capturedAt: '2026-10-07' },
  });
}
const { heroImageId: hubHero, ...hub } = seed.hub;
docs.push({
  ...hub,
  _id: 'hub-settings',
  _type: 'hubSettings',
  heroImage: ref(`image-${hubHero}`),
  source: { system: 'wix', capturedAt: '2026-10-07' },
});
const ids = new Set(docs.map((d) => d._id));
const assetIds = new Set(Object.values(assetHashes));
function checkRefs(value: unknown) {
  if (Array.isArray(value)) value.forEach(checkRefs);
  else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (obj._ref && !assetIds.has(String(obj._ref)) && !ids.has(obj._ref))
      throw new Error(`Broken reference: ${obj._ref}`);
    Object.values(obj).forEach(checkRefs);
  }
}
docs.forEach(checkRefs);
await mkdir('content/generated', { recursive: true });
await writeFile(
  'content/generated/sanity-import.ndjson',
  docs.map((d) => JSON.stringify(d)).join('\n') + '\n',
);
await writeFile(
  'content/generated/migration-manifest.json',
  JSON.stringify(
    {
      mode: write ? 'write' : 'dry-run',
      documents: docs.length,
      images: seed.images.length,
      assetHashes,
      conflicts: seed.offerings
        .filter((o) => o.sourceNotes?.length)
        .map((o) => ({ id: o.id, notes: o.sourceNotes })),
      cmsInventory:
        'verified: Webflow get_collection_list returned collections=[] on 2026-10-07; source material is static pages and assets',
    },
    null,
    2,
  ),
);
if (write) {
  const transaction = client!.transaction();
  docs.forEach((doc) => transaction.createIfNotExists(doc as MigrationDocument));
  await transaction.commit();
}
console.log(
  `${write ? 'Imported (existing documents preserved)' : 'Dry run complete'}: ${docs.length} documents, ${seed.images.length} images. No external writes without --write.`,
);
