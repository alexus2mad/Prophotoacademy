import { RoomTemplate } from '@/components/templates/RoomTemplate/RoomTemplate';
import { PracticeTemplate } from '@/components/templates/PracticeTemplate/PracticeTemplate';
import type { SlugPageProps } from '@/app/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { canonicalUrl, readyPractice } from '@/lib/ecosystem';
export async function generateStaticParams() {
  const content = await getContent();
  return [...content.rooms, ...content.practiceSessions].map((item) => ({ slug: item.slug }));
}
export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const item = [...content.rooms, ...content.practiceSessions].find((item) => item.slug === slug);
  return {
    title: item?.title,
    description: item?.description,
    alternates: { canonical: canonicalUrl('hub', slug) },
  };
}
export default async function HubDetail({ params }: SlugPageProps) {
  const { slug } = await params;
  const content = await getContent();
  const room = content.rooms.find((item) => item.slug === slug);
  const session = content.practiceSessions.find((item) => item.slug === slug);
  if (room) return <RoomTemplate room={room} content={content} />;
  if (!session || session.status === 'paused') notFound();
  const ready = readyPractice(session);
  const space = content.rooms.find((room) => room.id === session.roomId)!;
  const offering =
    ready && session.enrollmentOfferingId
      ? content.offerings.find((item) => item.id === session.enrollmentOfferingId)
      : undefined;
  const program = offering
    ? content.programs.find((item) => item.id === offering.programId)
    : undefined;
  return (
    <PracticeTemplate
      session={session}
      content={content}
      ready={ready}
      space={space}
      offering={offering}
      program={program}
    />
  );
}
