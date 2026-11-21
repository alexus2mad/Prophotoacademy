import { studioAcademyAudience, studioAcademyTrust } from '@/lib/studio-pages/academy';
import { siteField, siteSection } from '../../fields';
import { studioAssets } from '@/lib/studio-design/assets';

export const academyCommunity = siteSection('community', 'Для кого та хто викладає', [
  siteField('audience-eyebrow', 'Аудиторія · Надзаголовок', 'Кому підійде'),
  siteField('audience-title', 'Аудиторія · Заголовок', 'Для тих, хто'),
  siteField('audience-emphasis', 'Аудиторія · Акцент заголовка', '*хоче'),
  siteField('audience-end', 'Аудиторія · Завершення заголовка', 'свій стиль'),
  siteField(
    'audience-description',
    'Аудиторія · Опис',
    'ProPhoto Academy для тих, хто хоче перестати робити по 20 кадрів з надією хоча б на один вдалий, відкрити свій стиль і створювати якісний візуал, який працює на результат.',
    'multiline',
  ),
  siteField('trust-title', 'Довіра · Заголовок', 'Чому нам довіряють'),
  siteField('lecturers-eyebrow', 'Лектори · Надзаголовок', 'Засновниці'),
  siteField('lecturers-title', 'Лектори · Заголовок', 'Хто вчить'),
  siteField('olena-image', 'Олена · Фото', studioAssets.academy.imgImgOlena.src, 'image'),
  siteField('olena-image-alt', 'Олена · Опис зображення', 'Олена Попова'),
  siteField('olena-name', 'Олена · Назва', 'Олена Попова'),
  siteField('olena-role', 'Олена · Посада', 'Засновниця · рекламний фотограф'),
  siteField(
    'olena-bio',
    'Олена · Біографія',
    'Професійний рекламний фотограф більше 15 років. Викладання та майстер-класи для Jysk, Mastercard, ООН, iSpace, DragonCapital, BihusInfo, у Києво-Могилянській академії. Знає, як зробити контент стратегічно точним.',
    'multiline',
  ),
  siteField(
    'oleksandra-image',
    'Олександра · Фото',
    studioAssets.academy.imgImgOleksandra.src,
    'image',
  ),
  siteField('oleksandra-image-alt', 'Олександра · Опис зображення', 'Олександра Куліняк'),
  siteField('oleksandra-name', 'Олександра · Назва', 'Олександра Куліняк'),
  siteField('oleksandra-role', 'Олександра · Посада', 'Співавторка школи · мобільний фотограф'),
  siteField(
    'oleksandra-bio',
    'Олександра · Біографія',
    'Спеціалістка із візуального контенту, контент-креаторка. Співпраця з ресторанами, спортивними клубами, магазинами та державними установами. Викладання для DragonCapital, BihusInfo, у Києво-Могилянській академії.',
    'multiline',
  ),
  ...studioAcademyAudience.flatMap((point, i) => [
    siteField('audience-' + i + '-title', point.title + ' · назва', point.title),
    siteField('audience-' + i + '-description', point.title + ' · опис', point.text, 'multiline'),
  ]),
  ...studioAcademyTrust.flatMap((point, i) => [
    siteField('trust-' + i + '-title', point.title + ' · назва', point.title),
    siteField('trust-' + i + '-description', point.title + ' · опис', point.text, 'multiline'),
  ]),
]);
