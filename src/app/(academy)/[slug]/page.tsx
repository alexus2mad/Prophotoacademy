import type { SlugPageProps } from '@/app/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { getContent } from '@/lib/content';
import { ProgramTemplate } from '@/components/templates/ProgramTemplate/ProgramTemplate';
import { connection } from 'next/server';
import { enrollmentOptions } from '@/lib/commerce/catalog';
import { findOffering } from '@/lib/content/selectors';
export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const page =
    content.programs.find((p) => p.slug === slug) || content.pages.find((p) => p.slug === slug);
  return page
    ? {
        title: ('seo' in page ? page.seo?.title : undefined) || page.title,
        description: 'description' in page ? page.seo?.description || page.description : undefined,
        alternates: { canonical: `/${slug}` },
      }
    : {};
}
export default async function Detail({ params }: SlugPageProps) {
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== 'pages') await connection();
  const { slug } = await params;
  const content = await getContent();
  const program = content.programs.find((p) => p.slug === slug);
  if (program) {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000';
    const schema = {
      '@context': 'https://schema.org',
      '@type': program.category === 'course' ? 'Course' : 'CreativeWork',
      name: program.title,
      description: program.description,
      url: `${base}/${program.slug}`,
      provider: { '@type': 'EducationalOrganization', name: content.settings.name, url: base },
    };
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
        />
        <ProgramTemplate
          program={program}
          content={content}
          enrollment={await enrollmentOptions(findOffering(content, program.id))}
        />
      </>
    );
  }
  const page = content.pages.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <div className="container">
      <div className="page-heading">
        <h1>{page.title}</h1>
      </div>
      <article className="prose">
        <PortableText value={page.body} />
      </article>
    </div>
  );
}
