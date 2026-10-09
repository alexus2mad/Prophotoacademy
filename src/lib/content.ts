import type { SanityContent } from './content/types';
import 'server-only';
import { cache } from 'react';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { draftMode } from 'next/headers';
import fixture from '../../content/academy.json';
import type { AcademyContent } from './content/types';

const query = `{
  "programs": *[_type == "program"] | order(sortOrder asc) {..., "id": coalesce(legacyId,_id), "slug": slug.current, "imageId": coalesce(image->legacyId,image->_id), "instructorIds": coalesce(instructors[]->{ "id": coalesce(legacyId,_id) }.id,[]), "workIds": coalesce(works[]->{ "id": coalesce(legacyId,_id) }.id,[]), "audience": coalesce(audience,[]), "outcomes": coalesce(outcomes,[]), "modules": coalesce(modules[]{..., "topics": coalesce(topics,[])},[]), "faqs": coalesce(faqs,[])},
  "offerings": *[_type == "offering"] {..., "id": coalesce(legacyId,_id), "programId": coalesce(program->legacyId,program->_id), "packages": coalesce(packages[]{..., "includes": coalesce(includes,[])},[])},
  "images": *[_type == "editorialImage"] {..., "id": coalesce(legacyId,_id), "src": image.asset->url, "width": image.asset->metadata.dimensions.width, "height": image.asset->metadata.dimensions.height},
  "instructors": *[_type == "instructor"] {..., "id": coalesce(legacyId,_id), "imageId": coalesce(image->legacyId,image->_id)},
  "works": *[_type == "studentWork"] | order(sortOrder asc) {..., "id": coalesce(legacyId,_id), "imageId": coalesce(image->legacyId,image->_id)},
  "pages": *[_type == "editorialPage"] {..., "id": coalesce(legacyId,_id), "slug": slug.current},
  "testimonials": *[_type == "testimonial"] | order(sortOrder asc) {..., "id": coalesce(legacyId,_id), "image": screenshot.asset->url, "programId": coalesce(program->legacyId,program->_id)},
  "settings": *[_type == "siteSettings" && _id == "site-settings"][0] {..., "primaryProgramId": coalesce(primaryProgram->legacyId,primaryProgram->_id,""), "heroImageId": coalesce(heroImage->legacyId,heroImage->_id)},
  "rooms": *[_type == "studioRoom"] | order(sortOrder asc) {...,"id":coalesce(legacyId,_id),"slug":slug.current,"imageId":coalesce(image->legacyId,image->_id),"galleryImageIds":coalesce(gallery[]->{"id":coalesce(legacyId,_id)}.id,[]),"features":coalesce(features,[])},
  "practiceSessions": *[_type == "practiceSession"] {...,"id":coalesce(legacyId,_id),"slug":slug.current,"imageId":coalesce(image->legacyId,image->_id),"roomId":coalesce(room->legacyId,room->_id),"programIds":coalesce(programs[]->{"id":coalesce(legacyId,_id)}.id,[]),"enrollmentOfferingId":coalesce(enrollmentOffering->legacyId,enrollmentOffering->_id)},
  "hub": *[_type == "hubSettings" && _id == "hub-settings"][0] {...,"heroImageId":coalesce(heroImage->legacyId,heroImage->_id)}
}`;

export const getContent = cache(async (): Promise<AcademyContent> => {
  const mode = process.env.CONTENT_MODE || 'fixture';
  if (mode === 'fixture') return fixture as AcademyContent;
  if (mode !== 'sanity') throw new Error('CONTENT_MODE must be fixture or sanity');
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) throw new Error('Sanity mode requires project ID and dataset');
  const preview = (await draftMode()).isEnabled;
  if (preview && !process.env.SANITY_API_READ_TOKEN)
    throw new Error('Preview requires an authenticated read token');
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2026-10-01',
    useCdn: !preview,
    token: process.env.SANITY_API_READ_TOKEN,
    perspective: preview ? 'drafts' : 'published',
  });
  const content = await client.fetch<SanityContent>(
    query,
    {},
    { next: { revalidate: preview ? 0 : 60, tags: ['academy-content'] } },
  );
  if (!content.settings || !content.programs?.length)
    throw new Error('Sanity content is empty. Run the reviewed migration before switching modes.');
  if (!content.hub || !content.rooms?.length)
    throw new Error(
      'Hub content is missing. Import the ecosystem migration before publishing the connected sites.',
    );
  const builder = createImageUrlBuilder(client);
  const images = content.images.map((image) => {
    const crop = image.image.crop || { left: 0, right: 0, top: 0, bottom: 0 };
    const croppedWidth = Math.max(1, Math.round(image.width * (1 - crop.left - crop.right)));
    const croppedHeight = Math.max(1, Math.round(image.height * (1 - crop.top - crop.bottom)));
    const width = Math.min(1800, croppedWidth);
    const height = Math.max(1, Math.round((croppedHeight * width) / croppedWidth));
    const hotspot = image.image.hotspot;
    const focal = hotspot
      ? `${Math.max(0, Math.min(100, ((hotspot.x - crop.left) / (1 - crop.left - crop.right)) * 100))}% ${Math.max(0, Math.min(100, ((hotspot.y - crop.top) / (1 - crop.top - crop.bottom)) * 100))}%`
      : undefined;
    return {
      ...image,
      width,
      height,
      src: builder.image(image.image).width(width).height(height).fit('crop').auto('format').url(),
      position: image.position || focal,
    };
  });
  return { ...content, images };
});
export { findImage, findOffering } from './content/selectors';
