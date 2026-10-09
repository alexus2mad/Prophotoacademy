import { getContent } from '@/lib/content';
import { AcademyHomeTemplate } from '@/components/templates/AcademyHomeTemplate/AcademyHomeTemplate';

export default async function Home() {
  return <AcademyHomeTemplate content={await getContent()} />;
}
