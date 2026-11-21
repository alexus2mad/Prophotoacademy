import { siteField, siteSection } from '../../fields';
import { studioAssets } from '@/lib/studio-design/assets';

export const homeFounder = siteSection('founder', 'Олена Попова', [
  siteField('portrait-image', 'Портрет · Фото', studioAssets.home.imgImgHome144009.src, 'image'),
  siteField(
    'portrait-mobile-image',
    'Портрет · Мобільний варіант · Фото',
    studioAssets.homeMobile.imgImgHome39008.src,
    'image',
  ),
  siteField(
    'portrait-image-alt',
    'Портрет · Опис зображення',
    'Олена Попова — засновниця ProPhoto Academy',
  ),
  siteField('eyebrow', 'Надзаголовок', 'Засновниця · рекламний фотограф'),
  siteField('title', 'Заголовок', 'Олена Попова'),
  siteField(
    'intro',
    'Вступ',
    'Професійний рекламний фотограф більше 15 років та засновниця школи створення візуального контенту ProPhotoAcademy. Має потужний комерційний бекграунд: досвід роботи з міжнародним і локальним бізнесом.',
    'multiline',
  ),
  siteField(
    'biography',
    'Досвід',
    'Викладання та майстер-класи для Jysk, Mastercard, ООН, iSpace, DragonCapital, BihusInfo, у Києво-Могилянській академії, ГО Право на захист і багатьох інших брендів та компаній.',
    'multiline',
  ),
  siteField('course-action', 'Курс · Текст кнопки', 'Обрати курс'),
  siteField('lecturers-action', 'Лектори · Текст кнопки', 'Усі лектори'),
]);
