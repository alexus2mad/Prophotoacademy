import { homeInquiry } from '@/lib/site-editor/brand/home/inquiry';
import { bindSection } from '@/lib/site-editor/bind-section';
import { StudioHomeExperience } from '@/components/organisms/StudioHomeExperience/StudioHomeExperience';
import { StudioHomeFounder } from '@/components/organisms/StudioHomeFounder/StudioHomeFounder';
import { StudioHomeProof } from '@/components/organisms/StudioHomeProof/StudioHomeProof';
import { StudioHomeReviews } from '@/components/organisms/StudioHomeReviews/StudioHomeReviews';
import { StudioHomeWorks } from '@/components/organisms/StudioHomeWorks/StudioHomeWorks';
import { StudioHomeBanner } from '@/components/organisms/StudioHomeBanner/StudioHomeBanner';
import { StudioInquirySection } from '@/components/organisms/StudioInquirySection/StudioInquirySection';
import { StudioSpaceSections } from '@/components/organisms/StudioSpaceSections/StudioSpaceSections';
import { StudioShopSelection } from '@/components/organisms/StudioShopSelection/StudioShopSelection';
import { ecosystemDestinations } from '@/lib/ecosystem';
import { studioHomeDirections, studioHomeWorks } from '@/lib/studio-home/selectors';
import type { StudioHomeTemplateProps } from './types';

export function StudioHomeTemplate({
  page,
  studioPage,
  shopPage,
  content,
}: StudioHomeTemplateProps) {
  const { text } = bindSection(page, homeInquiry);
  return (
    <StudioHomeExperience
      page={page}
      directions={studioHomeDirections(content)}
      studio={<StudioSpaceSections page={studioPage} address={content.hub.address} />}
      shop={<StudioShopSelection page={shopPage} shopUrl={ecosystemDestinations.shop} />}
      academy={
        <>
          <StudioHomeFounder page={page} />
          <StudioHomeProof page={page} />
          <StudioHomeReviews page={page} />
          <StudioHomeWorks page={page} works={studioHomeWorks} />
          <StudioHomeBanner page={page} destination="shop" />
          <StudioHomeBanner page={page} destination="studio" />
          <div data-home-section="inquiry" data-site-section="inquiry">
            <StudioInquirySection
              title={text('title')}
              hand={text('emphasis')}
              description={text('intro')}
              context={{ subject: 'program-selection', source: 'consultation' }}
            />
          </div>
        </>
      }
    />
  );
}
