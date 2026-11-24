import { WorkshopIntensiveTemplate } from '@/components/templates/WorkshopIntensiveTemplate/WorkshopIntensiveTemplate';
import { workshopTicket } from '@/lib/site-editor/workshop-ticket/presentation';
import { Fragment } from 'react';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { legalChapters, isLegalHeading } from '@/lib/site-editor/legal-chapters';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
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
import { legalTypography } from '@/lib/site-editor/legal-typography';
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
    const title = readField(published, 'landing-cover', 'title') || published.title;
    return academyMetadata(published.path, {
      title,
      description: readField(published, 'landing-cover', 'description'),
      socialTitle: title,
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
        <MarketingComposition page={pageContent} />
      </>
    );
  }
  const page = content.pages.find((p) => p.slug === slug);
  if (!page) {
    if (pageContent?.template === 'workshop-intensive')
      return (
        <WorkshopIntensiveTemplate page={pageContent} ticket={await workshopTicket(pageContent)} />
      );
    if (pageContent?.sections.some((s) => s.id === 'landing-cover'))
      return <EditorialLandingTemplate page={pageContent} />;
    notFound();
  }
  const legal = legalContent(page, pageContent);
  return (
    <>
      <div className="container">
        <MarketingSlot page={pageContent} id="intro" />
        <div className="page-heading" data-site-section="intro">
          <h1 data-site-field="title">{legal.title}</h1>
        </div>
        <article className="prose">
          {legalChapters(legalTypography(legal.body, pageContent)).map((blocks) => (
            <Fragment key={blocks[0]._key}>
              {isLegalHeading(blocks[0]) && (
                <MarketingSlot page={pageContent} id={'block-' + blocks[0]._key} />
              )}
              <PortableText
                value={blocks}
                components={{
                  marks: {
                    siteTypography: ({ value, children }) => (
                      <span data-site-section={value?.sectionId} data-site-field={value?.fieldId}>
                        {children}
                      </span>
                    ),
                  },
                }}
              />
            </Fragment>
          ))}
        </article>
      </div>
      <MarketingComposition page={pageContent} />
    </>
  );
}
