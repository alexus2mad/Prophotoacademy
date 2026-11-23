import type { Work } from '@/lib/content/types';
import type { StudioAsset } from '@/lib/studio-design/types';

export type CreatorLecturer = {
  id: string;
  name: string;
  roles: readonly string[];
  bio?: string;
  portrait?: StudioAsset;
};

export type CourseTextItem = { title: string; text: string };

/** A display heading split into its fixed lines, ending with a handwritten accent. */
export type CourseHeading = { lines: readonly string[]; hand: string };

/** A course-owned work shown in the rail beside the content gallery. */
export type CourseExtraWork = StudioAsset & {
  id: string;
  alt: string;
  device: Work['device'];
  preserveFraming?: boolean;
};

/** Works that lead the rail before the remaining content gallery. */
export type CourseWorksOpening = {
  ids: readonly string[];
  extras: readonly CourseExtraWork[];
};

/** Course-specific copy and photography for the Creator-style course layout. */
export type StudioCourseEditorial = {
  hero: {
    asset: StudioAsset;
    alt: string;
    hand: string;
    title: string;
    subject: string;
    facts?: readonly string[];
    position?: string;
    mobilePosition?: string;
  };
  intro: {
    eyebrow: string;
    heading: CourseHeading;
    description: string;
    mobileDescription?: string;
  };
  audience: readonly CourseTextItem[];
  benefits: readonly CourseTextItem[];
  learningSteps: readonly CourseTextItem[];
  worksOpening?: CourseWorksOpening;
  /** Works filter order; defaults to camera, then phone. */
  worksDevices?: readonly Work['device'][];
  faculty?: readonly CreatorLecturer[];
};
