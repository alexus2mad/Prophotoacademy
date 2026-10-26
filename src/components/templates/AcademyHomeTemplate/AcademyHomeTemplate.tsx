import localFont from 'next/font/local';
import { AcademyDesignHero } from '@/components/organisms/AcademyDesignHero/AcademyDesignHero';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
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
  src: [
    { path: '../../../app/fonts/kyivtype-light.woff2', weight: '300', style: 'normal' },
    { path: '../../../app/fonts/kyivtype-black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-home-display',
  display: 'swap',
});
const text = localFont({
  src: '../../../app/fonts/inter-home-variable.woff2',
  variable: '--font-home-text',
  weight: '100 900',
  display: 'swap',
});
export function AcademyHomeTemplate({ content }: AcademyHomeTemplateProps) {
  return (
    <div className={`academy-design-home ${display.variable} ${text.variable}`}>
      <AcademyDesignHero shopUrl={content.settings.shop} />
      <AcademyDirections directions={academyDirections(content)} />
      <Consultation compact />
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
