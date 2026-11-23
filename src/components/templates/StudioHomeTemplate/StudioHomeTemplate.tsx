import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
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
    <>
      <MarketingComposition page={page} part="typography" within="homepage" />
      <StudioHomeExperience
        page={page}
        directions={studioHomeDirections(content)}
        beforeHero={{
          academy: <MarketingSlot page={page} id="hero" />,
          studio: <MarketingSlot page={studioPage} id="hero" />,
          shop: <MarketingSlot page={shopPage} id="hero" />,
        }}
        studio={
          <>
            <StudioSpaceSections page={studioPage} address={content.hub.address} />
            <MarketingComposition page={studioPage} within="home-panel-studio" />
          </>
        }
        shop={
          <>
            <MarketingSlot page={shopPage} id="selection" />
            <StudioShopSelection page={shopPage} shopUrl={ecosystemDestinations.shop} />
            <MarketingComposition page={shopPage} within="home-panel-shop" />
          </>
        }
        academy={
          <>
            <MarketingSlot page={page} id="founder" />
            <StudioHomeFounder page={page} />
            <MarketingSlot page={page} id="proof" />
            <StudioHomeProof page={page} />
            <MarketingSlot page={page} id="reviews" />
            <StudioHomeReviews page={page} />
            <MarketingSlot page={page} id="gallery" />
            <StudioHomeWorks page={page} works={studioHomeWorks} />
            <MarketingSlot page={page} id="shop-banner" />
            <StudioHomeBanner page={page} destination="shop" />
            <MarketingSlot page={page} id="studio-banner" />
            <StudioHomeBanner page={page} destination="studio" />
            <MarketingSlot page={page} id="inquiry" />
            <div data-home-section="inquiry">
              <StudioInquirySection
                identifiers={{
                  section: 'inquiry',
                  title: 'title',
                  hand: 'emphasis',
                  description: 'intro',
                }}
                title={text('title')}
                hand={text('emphasis')}
                description={text('intro')}
                context={{ subject: 'program-selection', source: 'consultation' }}
              />
            </div>
            <MarketingComposition page={page} part="blocks" />
          </>
        }
      />
    </>
  );
}
