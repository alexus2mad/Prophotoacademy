import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { studioAssets } from '@/lib/studio-design/assets';
import styles from './StudioHomeFounder.module.css';

export function StudioHomeFounder() {
  return (
    <section
      className={styles.founder}
      data-home-section="founder"
      aria-labelledby="home-founder-title"
    >
      <StudioHomePicture
        image={studioAssets.home.imgImgHome144009}
        mobileImage={studioAssets.homeMobile.imgImgHome39008}
        alt="Олена Попова — засновниця ProPhoto Academy"
        className={styles.portrait}
        sizes="(max-width: 760px) 100vw, 42vw"
      />
      <div className={`${styles.body} studio-wrap`}>
        <p className="studio-label">Засновниця · рекламний фотограф</p>
        <h2 className="studio-title" id="home-founder-title">
          Олена Попова
        </h2>
        <p className="studio-lead">
          Професійний рекламний фотограф більше 15 років та засновниця школи створення візуального
          контенту ProPhotoAcademy. Має потужний комерційний бекграунд: досвід роботи з міжнародним
          і локальним бізнесом.
        </p>
        <p className={styles.background}>
          Викладання та майстер-класи для Jysk, Mastercard, ООН, iSpace, DragonCapital, BihusInfo, у
          Києво-Могилянській академії, ГО Право на захист і багатьох інших брендів та компаній.
        </p>
        <div className={`${styles.actions} studio-actions`}>
          <Link href={studioAcademyDestinations.courses} className="studio-button">
            Обрати курс<span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.lecturers} href="/academy#lecturers">
            Усі лектори
          </Link>
        </div>
      </div>
    </section>
  );
}
