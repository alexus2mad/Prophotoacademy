import { EcosystemMeasurement } from '@/components/behaviors/EcosystemMeasurement/EcosystemMeasurement';
import { Footer } from '@/components/organisms/Footer/Footer';
import { Header } from '@/components/organisms/Header/Header';
import { HubFooter } from '@/components/organisms/HubFooter/HubFooter';
import { InquiryDialog } from '@/components/organisms/InquiryDialog/InquiryDialog';
import type { SiteShellProps } from './types';
export function SiteShell(props: SiteShellProps) {
  return (
    <>
      <EcosystemMeasurement site={props.site} />
      <Header site={props.site} />
      <main id="main">{props.children}</main>
      {props.site === 'academy' ? (
        <Footer settings={props.settings} />
      ) : (
        <HubFooter settings={props.settings} />
      )}
      <InquiryDialog
        site={props.site}
        privacyUrl={props.site === 'hub' ? props.settings.privacyUrl : undefined}
      />
    </>
  );
}
