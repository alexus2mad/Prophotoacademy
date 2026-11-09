import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import {
  studioAcademyAudience,
  studioAcademyTrust,
  studioAcademyReviews,
} from '@/lib/studio-pages/academy';
import styles from './StudioAcademyCommunity.module.css';

export function StudioAcademyCommunity() {
  return (
    <>
      <section id="about" className="studio-band studio-light">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label">Кому підійде</p>
            <h2 className="studio-title">
              Для тих, хто <span className="studio-hand">*хоче</span> свій стиль
            </h2>
            <p className="studio-lead">
              ProPhoto Academy для тих, хто хоче перестати робити по 20 кадрів з надією хоча б на
              один вдалий, відкрити свій стиль і створювати якісний візуал, який працює на
              результат.
            </p>
          </header>
          <div className={styles.audience}>
            {studioAcademyAudience.map((point) => (
              <article className={styles.point} key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="studio-band studio-dark">
        <div className="studio-wrap">
          <header className={styles.head}>
            <h2 className="studio-title">Чому нам довіряють</h2>
          </header>
          <div className={styles.trust}>
            {studioAcademyTrust.map((point) => (
              <article className={styles.point} key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="lecturers" className="studio-band studio-light">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label">Засновниці</p>
            <h2 className="studio-title">Хто вчить</h2>
          </header>
          <div className={styles.people}>
            <article className={styles.person}>
              <StudioImage
                asset={studioAssets.academy.imgImgOlena}
                alt="Олена Попова"
                fit="cover"
                className={styles.portrait}
                sizes="250px"
              />
              <div>
                <h3>Олена Попова</h3>
                <p className="studio-label">Засновниця · рекламний фотограф</p>
                <p>
                  Професійний рекламний фотограф більше 15 років. Викладання та майстер-класи для
                  Jysk, Mastercard, ООН, iSpace, DragonCapital, BihusInfo, у Києво-Могилянській
                  академії. Знає, як зробити контент стратегічно точним.
                </p>
              </div>
            </article>
            <article className={styles.person}>
              <StudioImage
                asset={studioAssets.academy.imgImgOleksandra}
                alt="Олександра Куліняк"
                fit="cover"
                className={styles.portrait}
                sizes="250px"
              />
              <div>
                <h3>Олександра Куліняк</h3>
                <p className="studio-label">Співавторка школи · мобільний фотограф</p>
                <p>
                  Спеціалістка із візуального контенту, контент-креаторка. Співпраця з ресторанами,
                  спортивними клубами, магазинами та державними установами. Викладання для
                  DragonCapital, BihusInfo, у Києво-Могилянській академії.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="studio-band studio-dark">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label">Відгуки учнів</p>
            <h2 className="studio-title">Що кажуть випускники</h2>
          </header>
          <div
            className={styles.reviews}
            tabIndex={0}
            role="region"
            aria-label="Відгуки випускників, прокрутіть для перегляду"
          >
            {studioAcademyReviews.map((review) => (
              <article className={styles.review} key={review.name}>
                <header>
                  <h3>{review.name}</h3>
                  <span aria-label="5 із 5">★★★★★</span>
                </header>
                <p>{review.title}</p>
                <blockquote>{review.quote}</blockquote>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
