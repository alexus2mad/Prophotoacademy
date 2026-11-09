import { StudioHomeExperience } from '@/components/organisms/StudioHomeExperience/StudioHomeExperience';
import { StudioHomeFounder } from '@/components/organisms/StudioHomeFounder/StudioHomeFounder';
import { StudioHomeProof } from '@/components/organisms/StudioHomeProof/StudioHomeProof';
import { StudioHomeReviews } from '@/components/organisms/StudioHomeReviews/StudioHomeReviews';
import { StudioHomeWorks } from '@/components/organisms/StudioHomeWorks/StudioHomeWorks';
import { StudioHomeBanner } from '@/components/organisms/StudioHomeBanner/StudioHomeBanner';
import { StudioInquirySection } from '@/components/organisms/StudioInquirySection/StudioInquirySection';
import { studioHomeDirections, studioHomeWorks } from '@/lib/studio-home/selectors';
import type { StudioHomeTemplateProps } from './types';

export function StudioHomeTemplate({ content }: StudioHomeTemplateProps) {
  return (
    <StudioHomeExperience directions={studioHomeDirections(content)}>
      <StudioHomeFounder />
      <StudioHomeProof />
      <StudioHomeReviews />
      <StudioHomeWorks works={studioHomeWorks} />
      <StudioHomeBanner destination="shop" />
      <StudioHomeBanner destination="studio" />
      <div data-home-section="inquiry">
        <StudioInquirySection
          title="Готові бачити"
          hand="більше?"
          description="Заповніть форму та отримайте безкоштовну консультацію з нашим спеціалістом."
          context={{ subject: 'program-selection', source: 'consultation' }}
        />
      </div>
    </StudioHomeExperience>
  );
}
