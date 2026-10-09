import type { SourceImage } from './types';
import seed from '../content/academy.json';
import { stat } from 'node:fs/promises';
const errors: string[] = [];
for (const collection of [
  seed.programs,
  seed.offerings,
  seed.images,
  seed.instructors,
  seed.works,
  seed.pages,
  seed.testimonials,
]) {
  const ids = collection.map((item) => item.id);
  if (new Set(ids).size !== ids.length) errors.push('Duplicate IDs within a content type');
}
const imageIds = new Set(seed.images.map((i) => i.id));
const programIds = new Set(seed.programs.map((p) => p.id));
const instructorIds = new Set(seed.instructors.map((p) => p.id));
const workIds = new Set(seed.works.map((p) => p.id));
for (const program of seed.programs) {
  if (!imageIds.has(program.imageId)) errors.push(`Image: ${program.id}`);
  program.instructorIds.forEach((id) => {
    if (!instructorIds.has(id)) errors.push(`Instructor: ${id}`);
  });
  program.workIds.forEach((id) => {
    if (!workIds.has(id)) errors.push(`Work: ${id}`);
  });
  if (!program.audience.length || !program.outcomes.length || !program.sourceUrl)
    errors.push(`Incomplete program: ${program.id}`);
}
if (
  seed.settings.primaryProgramId &&
  !seed.programs.some(
    (program) => program.id === seed.settings.primaryProgramId && program.category === 'course',
  )
)
  errors.push('Primary program must reference a course');
for (const offering of seed.offerings) {
  if (!programIds.has(offering.programId)) errors.push(`Offering reference: ${offering.id}`);
  const ids = offering.packages.map((p) => p.id);
  if (new Set(ids).size !== ids.length) errors.push(`Package IDs: ${offering.id}`);
  for (const pack of offering.packages)
    if (pack.price <= 0 || !Number.isInteger(pack.price)) errors.push(`Price: ${pack.id}`);
}
for (const image of seed.images) {
  if (
    !image.alt ||
    !image.credit ||
    (!image.driveId && !(image as SourceImage).sourceUrl) ||
    !image.width ||
    !image.height
  )
    errors.push(`Image metadata: ${image.id}`);
  try {
    const file = await stat(`public${image.src}`);
    if (file.size > 500_000) errors.push(`Image too large: ${image.id}`);
  } catch {
    errors.push(`Missing photo: ${image.id}`);
  }
}
for (const room of seed.rooms) {
  if (
    !imageIds.has(room.imageId) ||
    !room.galleryImageIds.every((id) => imageIds.has(id)) ||
    room.pricePerHour <= 0
  )
    errors.push(`Invalid studio room: ${room.id}`);
}
for (const session of seed.practiceSessions) {
  if (
    !imageIds.has(session.imageId) ||
    !seed.rooms.some((room) => room.id === session.roomId) ||
    !session.programIds.every((id) => programIds.has(id))
  )
    errors.push(`Invalid practice references: ${session.id}`);
}
if (!imageIds.has(seed.hub.heroImageId) || !seed.hub.bookingUrl.startsWith('https://'))
  errors.push('Invalid Hub settings');
for (const work of seed.works)
  if (!imageIds.has(work.imageId)) errors.push(`Work image: ${work.id}`);
for (const page of seed.pages)
  if (page.body.length < 10) errors.push(`Legal body incomplete: ${page.slug}`);
if (seed.pages.length !== 2 || seed.testimonials.length < 1)
  errors.push('Missing legal pages or verified testimonials');
const slugs = [...seed.programs, ...seed.pages].map((p) => p.slug);
if (new Set(slugs).size !== slugs.length) errors.push('Duplicate slugs');
if (errors.length) throw new Error(errors.join('\n'));
console.log(
  `Validated ${seed.programs.length} programs, ${seed.offerings.length} offerings, ${seed.images.length} credited photos, ${seed.pages.length} legal pages and ${seed.testimonials.length} source-attributed reviews/case stories.`,
);
