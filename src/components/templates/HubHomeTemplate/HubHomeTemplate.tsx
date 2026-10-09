import { HubArrival } from '@/components/organisms/HubArrival/HubArrival';
import { HubHero } from '@/components/organisms/HubHero/HubHero';
import { HubSpaces } from '@/components/organisms/HubSpaces/HubSpaces';
import { PracticePreview } from '@/components/organisms/PracticePreview/PracticePreview';
import type { HubHomeTemplateProps } from './types';
export function HubHomeTemplate({ content }: HubHomeTemplateProps) {
  const { hub } = content;
  return (
    <>
      <HubHero content={content} hub={hub} />
      <HubSpaces content={content} />
      <div className="container editorial-section">
        <PracticePreview content={content} />
      </div>
      <HubArrival hub={hub} />
    </>
  );
}
