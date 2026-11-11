import { getContent } from '@/lib/content';
import { AcademyHomeTemplate } from '@/components/templates/AcademyHomeTemplate/AcademyHomeTemplate';
import { StudioHomeTemplate } from '@/components/templates/StudioHomeTemplate/StudioHomeTemplate';
import { academyDesign } from '@/lib/studio-design/variant';
import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-images/metadata';

export const metadata: Metadata = {
  title: { absolute: 'Pro Photo Academy — створюйте кадри, які працюють' },
  description:
    'Курси фотографії, відео та створення контенту на телефон і камеру. Онлайн і в Києві.',
  alternates: { canonical: '/' },
  ...socialMetadata('/'),
};

export default async function Home() {
  const content = await getContent();
  return academyDesign() === 'studio' ? (
    <StudioHomeTemplate content={content} />
  ) : (
    <AcademyHomeTemplate content={content} />
  );
}
