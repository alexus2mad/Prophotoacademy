import { brandReviewContent } from './brand/reviews';
import { academyCatalogContent } from './brand/academy/catalog';
import type { AcademyContent } from '@/lib/content/types';
import type { SitePage } from './types';
import { homeHero } from './brand/home/hero';
import { homeExposure } from './brand/home/exposure';
import { homeExposureTitle } from './brand/home/exposure-title';
import { homeFounder } from './brand/home/founder';
import { homeDirections } from './brand/home/directions';
import { homeWorks } from './brand/home/works';
import { homeBanners } from './brand/home/banners';
import { homeInquiry } from './brand/home/inquiry';
import { homeProof } from './brand/home/proof';
import { academyIntroduction } from './brand/academy/introduction';
import { academyPrograms } from './brand/academy/programs';
import { academyCommunity } from './brand/academy/community';
import { artworkWorkshop } from './brand/artwork/workshop';
import { artworkCurriculum } from './brand/artwork/curriculum';
import { studioHero } from './brand/studio/hero';
import { studioSpaces } from './brand/studio/spaces';
import { shopHero } from './brand/shop/hero';
import { shopSelection } from './brand/shop/selection';

export function brandSeeds(content?: AcademyContent): SitePage[] {
  return [
    {
      path: '/',
      title: 'Головна',
      kind: 'home',
      sections: [
        homeHero,
        homeExposure,
        homeExposureTitle,
        homeDirections,
        homeFounder,
        homeProof,
        ...brandReviewContent('home').sections,
        homeWorks,
        homeBanners,
        homeInquiry,
      ],
    },
    {
      path: '/academy',
      title: 'Академія',
      kind: 'landing',
      sections: [
        academyIntroduction,
        academyPrograms,
        ...(content ? academyCatalogContent(content.programs, content.images).sections : []),
        academyCommunity,
        ...brandReviewContent('academy').sections,
      ],
    },
    {
      path: '/ai-artwork',
      title: 'AI Artwork',
      kind: 'workshop',
      sections: [artworkWorkshop, artworkCurriculum],
    },
    {
      path: '/photo-studio',
      title: 'Фотостудія',
      kind: 'landing',
      sections: [studioHero, studioSpaces],
    },
    {
      path: '/shop',
      title: 'Магазин',
      kind: 'landing',
      sections: [shopHero, shopSelection],
    },
  ];
}
