import Link from 'next/link';
import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import { academyHomePhoto } from '@/lib/photography/academy-home';
export function AcademyDesignFounder() {
  return (
    <section className="academy-design-founder" aria-labelledby="academy-founder-title">
      <div className="academy-design-founder-photo">
        <PreparedPhoto image={academyHomePhoto('founder')} sizes="(max-width: 767px) 100vw, 45vw" />
      </div>
      <div className="academy-design-founder-copy">
        <h2 id="academy-founder-title">Олена Попова</h2>
        <p className="academy-design-eyebrow">Засновниця · рекламний фотограф</p>
        <p>
          Професійний рекламний фотограф більше 15 років та засновниця школи створення візуального
          контенту ProPhotoAcademy. Має потужний комерційний бекграунд — досвід роботи з міжнародним
          і локальним бізнесом.
        </p>
        <p>
          Викладання та майстер-класи для Jysk, Mastercard, ООН, iSpace, DragonCapital, BihusInfo, у
          Києво-Могилянській академії, ГО Право на захист і багатьох інших брендів та компаній.
        </p>
        <p>
          Вміє перетворювати візуал у мову, зрозумілу як брендам, так і їхній аудиторії. Знає, як
          зробити контент не просто «красивим», а стратегічно точним.
        </p>
        <Link href="/about-us#team" className="academy-inline-link">
          Познайомитися з командою
        </Link>
      </div>
    </section>
  );
}
