import { EditorialMotion } from '@/components/behaviors/EditorialMotion/EditorialMotion';
import { AcademyHero } from '@/components/organisms/AcademyHero/AcademyHero';
import { AcademyTestimonials } from '@/components/organisms/AcademyTestimonials/AcademyTestimonials';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
import { CourseSelection } from '@/components/organisms/CourseSelection/CourseSelection';
import { CustomTraining } from '@/components/organisms/CustomTraining/CustomTraining';
import { FounderSection } from '@/components/organisms/FounderSection/FounderSection';
import { LearningSection } from '@/components/organisms/LearningSection/LearningSection';
import { PracticePreview } from '@/components/organisms/PracticePreview/PracticePreview';
import { StudentExhibition } from '@/components/organisms/StudentExhibition/StudentExhibition';
import { findImage, findOffering } from '@/lib/content/selectors';
import { primaryProgram } from '@/lib/program-priority';
import type { AcademyHomeTemplateProps } from './types';
export function AcademyHomeTemplate({ content }: AcademyHomeTemplateProps) {
  const primary = primaryProgram(content);
  const offering = primary ? findOffering(content, primary.id) : undefined;
  const heroImage = findImage(content, primary?.imageId || content.settings.heroImageId);
  const courses = content.programs
    .filter((p) => p.featured && p.category === 'course' && p.id !== primary?.id)
    .slice(0, 3);
  const quotes = content.testimonials.filter(
    (t) => t.kind === 'quote' && t.quote && t.quote.length < 700,
  );
  const courseQuotes = primary ? quotes.filter((t) => t.programId === primary.id) : [];
  const testimonials = (courseQuotes.length ? courseQuotes : quotes).slice(0, 2);
  return (
    <>
      <EditorialMotion />
      <AcademyHero primary={primary} offering={offering} heroImage={heroImage} content={content} />
      <CourseSelection primary={primary} courses={courses} content={content} />
      <StudentExhibition content={content} />
      <LearningSection content={content} />
      <div className="container editorial-section" data-editorial-reveal>
        <PracticePreview content={content} programId={primary?.id} />
      </div>
      <FounderSection content={content} />
      {!!testimonials.length && (
        <AcademyTestimonials testimonials={testimonials} courseQuotes={courseQuotes} />
      )}
      <CustomTraining />
      <Consultation />
    </>
  );
}
