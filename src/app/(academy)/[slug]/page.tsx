import type { SlugPageProps } from '@/app/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { getContent } from '@/lib/content';
import { ProgramTemplate } from '@/components/templates/ProgramTemplate/ProgramTemplate';
import { StudioProgramTemplate } from '@/components/templates/StudioProgramTemplate/StudioProgramTemplate';
import { StudioCreatorTemplate } from '@/components/templates/StudioCreatorTemplate/StudioCreatorTemplate';
import { academyDesign } from '@/lib/studio-design/variant';
import { readSitePage } from '@/lib/site-editor/public';
import { programPresentationContent } from '@/lib/site-editor/program';
import { legalContent } from '@/lib/site-editor/support-pages';
import { readField } from '@/lib/site-editor/fields';
import { EditorialLandingTemplate } from '@/components/templates/EditorialLandingTemplate/EditorialLandingTemplate';
import type { SiteRouteProps } from '@/lib/site-editor/types';
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
  if (!page) {
    const published = await readSitePage('/' + slug);
    if (!published?.sections.some((s) => s.id === 'landing-cover')) return {};
    return academyMetadata(published.path, {
      title: readField(published, 'landing-cover', 'title') || published.title,
      description: readField(published, 'landing-cover', 'description'),
    });
  }
  return academyMetadata(`/${slug}`, {
    title: page.title,
    description: legalDescriptions.get(slug),
    socialTitle: page.title,
  });
}
export default async function Detail({ params, searchParams }: SlugPageProps & SiteRouteProps) {
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== 'pages') await connection();
  const { slug } = await params;
  const content = await getContent();
  const pageContent = await readSitePage('/' + slug, searchParams);
  const original = content.programs.find((p) => p.slug === slug);
  if (original) {
    const studio = academyDesign() === 'studio';
    const updated = programPresentationContent(content, original, pageContent);
    const { program, artwork } = updated;
    const editorial = studio ? updated.editorial : undefined;
    const enrollment = await enrollmentOptions(findOffering(content, program.id));
    const breadcrumb = academyBreadcrumbSchema([
      { name: academyName, path: '/' },
      { name: 'Програми академії', path: '/academy' },
      { name: program.title, path: `/${program.slug}` },
    ]);
    return (
      <>
        {program.category === 'course' && <JsonLd data={academyCourseSchema(program)} />}
        <JsonLd data={breadcrumb} />
        {editorial ? (
          <StudioCreatorTemplate
            program={program}
            content={updated.content}
            enrollment={enrollment}
            editorial={editorial}
            page={pageContent}
          />
        ) : studio ? (
          <StudioProgramTemplate
            program={program}
            content={updated.content}
            enrollment={enrollment}
            artwork={artwork}
            page={pageContent}
          />
        ) : (
          <ProgramTemplate program={program} content={updated.content} enrollment={enrollment} />
        )}
      </>
    );
  }
  const page = content.pages.find((p) => p.slug === slug);
  if (!page) {
    if (pageContent?.sections.some((s) => s.id === 'landing-cover'))
      return <EditorialLandingTemplate page={pageContent} />;
    notFound();
  }
  const legal = legalContent(page, pageContent);
  return (
    <div className="container">
      <div className="page-heading">
        <h1>{legal.title}</h1>
      </div>
      <article className="prose">
        <PortableText value={legal.body} />
      </article>
    </div>
  );
}
