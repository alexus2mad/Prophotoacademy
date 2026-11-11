import Link from 'next/link';
import { StatusFrame } from '@/components/templates/StatusFrame/StatusFrame';
import { academyProgramsHref } from '@/lib/navigation/academy';
export default function NotFound() {
  return (
    <StatusFrame>
      <p className="eyebrow">404</p>
      <h1>Цей кадр загубився</h1>
      <p>Сторінки немає, але ваша наступна програма може бути зовсім поруч.</p>
      <Link href={academyProgramsHref()} className="button">
        Переглянути програми
      </Link>
    </StatusFrame>
  );
}
