import localFont from 'next/font/local';
import { AcademyDesignHero } from '@/components/organisms/AcademyDesignHero/AcademyDesignHero';
import { AcademyDirections } from '@/components/organisms/AcademyDirections/AcademyDirections';
import { AcademyDesignFounder } from '@/components/organisms/AcademyDesignFounder/AcademyDesignFounder';
import { AcademyClients } from '@/components/organisms/AcademyClients/AcademyClients';
import { AcademyDesignVoices } from '@/components/organisms/AcademyDesignVoices/AcademyDesignVoices';
import { EcosystemBanner } from '@/components/molecules/EcosystemBanner/EcosystemBanner';
import { academyDirections, academyHomeTestimonials } from '@/lib/academy-home/selectors';
import { academyHomePhoto } from '@/lib/photography/academy-home';
import { siteHref } from '@/lib/ecosystem';
import type { AcademyHomeTemplateProps } from './types';
const display = localFont({
  src: '../../../app/fonts/kyivtype-black.woff2',
  variable: '--font-home-display',
  weight: '900',
  display: 'swap',
});
export function AcademyHomeTemplate({ content }: AcademyHomeTemplateProps) {
  return (
    <div className={'academy-design-home ' + display.variable}>
      <AcademyDesignHero shopUrl={content.settings.shop} />
      <AcademyDirections directions={academyDirections(content)} />
      <EcosystemBanner
        name="STUDIO"
        label="Студія екосистеми"
        description={content.hub.heroDescription}
        href={siteHref('hub')}
        linkLabel="До студії"
        image={academyHomePhoto('studio')}
      />
      <AcademyDesignFounder />
      <AcademyClients />
      <AcademyDesignVoices testimonials={academyHomeTestimonials(content)} />
      <EcosystemBanner
        name="SHOP"
        label="Магазин екосистеми"
        description="Уся необхідна техніка для зйомки — допоможемо підібрати під ваші задачі й бюджет."
        href={content.settings.shop}
        linkLabel="До магазину"
        image={academyHomePhoto('shop')}
      />
    </div>
  );
}
