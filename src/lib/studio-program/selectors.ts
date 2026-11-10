import { findImage, findOffering } from '@/lib/content/selectors';
import type { AcademyContent, Program } from '@/lib/content/types';
import type { EnrollmentOptions } from '@/lib/commerce/types';
import { programPresentation } from '@/lib/programs/selectors';
import { studioAssets } from '@/lib/studio-design/assets';
import type { StudioProgramArtwork, StudioProgramInstructor } from './types';

export function studioProgramArtwork(
  program: Program,
  content: AcademyContent,
): StudioProgramArtwork {
  if (program.id === 'program-visual') {
    return { asset: studioAssets.artifact.dir_gold, alt: 'Жінка в золотій сукні, що розвівається' };
  }
  if (program.id === 'program-commercial') {
    return { asset: studioAssets.artifact.hero_academy, alt: 'Жінка у вечірній сукні під водою' };
  }
  if (program.id === 'program-food') {
    return {
      asset: studioAssets.academy.imgImgContent2,
      alt: 'Стіл із ноутбуком та мікрофонами у студії',
    };
  }
  if (program.id === 'program-instagram') {
    return {
      asset: studioAssets.academy.imgImgSnow,
      alt: 'Жінка з білою тканиною в зимовому лісі',
    };
  }
  const image = findImage(content, program.imageId);
  return { asset: image, alt: image.alt };
}

export function studioProgramPage(
  program: Program,
  content: AcademyContent,
  enrollment?: EnrollmentOptions,
) {
  const offering = findOffering(content, program.id);
  const original = programPresentation(program, offering);
  const presentation = enrollment
    ? {
        ...original,
        open: enrollment.packageIds.length > 0,
        testEnrollment: enrollment.packageIds.length > 0 && enrollment.mode === 'disabled',
      }
    : original;
  const works = program.workIds.flatMap((id) => {
    const work = content.works.find((item) => item.id === id);
    return work && content.images.some((image) => image.id === work.imageId) ? [work] : [];
  });
  const instructors: StudioProgramInstructor[] = content.instructors
    .filter((instructor) => program.instructorIds.includes(instructor.id))
    .map((instructor) => ({
      ...instructor,
      asset:
        instructor.id === 'olena'
          ? studioAssets.academy.imgImgOlena
          : instructor.id === 'oleksandra'
            ? studioAssets.academy.imgImgOleksandra
            : findImage(content, instructor.imageId),
      alt: `Портрет: ${instructor.name}`,
    }));
  const reviews = content.testimonials.filter(
    (review) => review.quote && (!review.programId || review.programId === program.id),
  );
  return {
    offering,
    presentation,
    works,
    instructors,
    reviews,
    hero: studioProgramArtwork(program, content),
  };
}
