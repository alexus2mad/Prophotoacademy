import type { Metadata } from 'next';
import { getContent, findImage } from '@/lib/content';
import { Photo } from '@/components/atoms/Photo/Photo';
import { Consultation } from '@/components/organisms/Consultation/Consultation';
export const metadata: Metadata = {
  title: 'Про академію',
  description:
    'Pro Photo Academy. Олена Попова, Олександра Куліняк і навчання фотографії, відео та візуального контенту.',
  alternates: { canonical: '/about-us' },
};
export default async function About() {
  const content = await getContent();
  return (
    <>
      <div className="container">
        <div className="page-heading">
          <h1>Про академію</h1>
        </div>
        <section className="about-intro">
          <Photo image={findImage(content, 'workshop')} />
          <div>
            <h2>Знання, що працюють у кадрі</h2>
            <p>
              Академія навчає створювати візуальний контент на телефон і фотокамеру. Поєднуємо
              теорію, досвід рекламної фотографії та практику — онлайн і в Києві.
            </p>
            <p>
              Обирайте програму за своєю метою: освоїти основи, працювати з брендами або самостійно
              вести візуальний контент.
            </p>
          </div>
        </section>
        <section className="section stats-grid" aria-label="Академія в цифрах">
          <div>
            <strong>6 років</strong>
            <span>досвіду академії</span>
          </div>
          <div>
            <strong>3000+</strong>
            <span>випускників</span>
          </div>
          <div>
            <strong>17+</strong>
            <span>навчальних груп</span>
          </div>
        </section>
        <section className="section" id="team">
          <div className="section-heading">
            <div>
              <h2>Команда академії</h2>
            </div>
          </div>
          <div className="instructors-grid">
            {content.instructors.map((i) => (
              <article className="instructor-card" key={i.id}>
                <div className="instructor-photo">
                  <Photo image={findImage(content, i.imageId)} />
                </div>
                <h3>{i.name}</h3>
                <p>{i.role}</p>
                <p>{i.bio}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <Consultation />
    </>
  );
}
