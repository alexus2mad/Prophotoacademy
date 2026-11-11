import type { SlugPageProps } from '@/app/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { getContent } from '@/lib/content';
import { ProgramTemplate } from '@/components/templates/ProgramTemplate/ProgramTemplate';
import { StudioProgramTemplate } from '@/components/templates/StudioProgramTemplate/StudioProgramTemplate';
import { academyDesign } from '@/lib/studio-design/variant';
import { connection } from 'next/server';
import { enrollmentOptions } from '@/lib/commerce/catalog';
import { findOffering } from '@/lib/content/selectors';
import { JsonLd } from '@/components/atoms/JsonLd/JsonLd';
import { academyMetadata, academyName } from '@/lib/seo/metadata';
import { academyBreadcrumbSchema, academyCourseSchema } from '@/lib/seo/structured-data';

const legalDescriptions = new Map([
  [
    'privacy-policy',
    'Політика конфіденційності ProPhoto Academy: як академія використовує персональні дані та захищає приватність користувачів сайту.',
  ],
  [
    'terms-of-service',
    'Публічна оферта ProPhoto Academy: умови надання освітніх послуг, оплати та участі в програмах академії.',
  ],
]);

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const program = content.programs.find((p) => p.slug === slug);
  if (program) {
    const title = program.seo?.title?.trim() || program.title;
    const description = program.seo?.description?.trim() || program.description;
    return academyMetadata(`/${slug}`, { title, description, socialTitle: title });
  }
  const page = content.pages.find((p) => p.slug === slug);
  if (!page) return {};
  return academyMetadata(`/${slug}`, {
    title: page.title,
    description: legalDescriptions.get(slug),
    socialTitle: page.title,
  });
}
export default async function Detail({ params }: SlugPageProps) {
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== 'pages') await connection();
  const { slug } = await params;
  const content = await getContent();
  const program = content.programs.find((p) => p.slug === slug);
  if (program) {
    const Template = academyDesign() === 'studio' ? StudioProgramTemplate : ProgramTemplate;
    const breadcrumb = academyBreadcrumbSchema([
      { name: academyName, path: '/' },
      { name: 'Програми академії', path: '/academy' },
      { name: program.title, path: `/${program.slug}` },
    ]);
    return (
      <>
        {program.category === 'course' && <JsonLd data={academyCourseSchema(program)} />}
        <JsonLd data={breadcrumb} />
        <Template
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
