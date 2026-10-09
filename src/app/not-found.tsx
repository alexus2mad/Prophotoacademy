import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="container status-panel">
      <p className="eyebrow">404</p>
      <h1>Цей кадр загубився</h1>
      <p>Сторінки немає, але ваша наступна програма може бути зовсім поруч.</p>
      <Link href="/courses" className="button">
        Переглянути програми
      </Link>
    </div>
  );
}
