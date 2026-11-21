import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';
import { siteField, siteSection } from '../../fields';

export const homeModes = {
  studio: {
    image: studioAssets.artifact.hero_space,
    mobileImage: studioAssets.homeStudioMobile.imgImgHome390Studio01,
    kick: 'простір, щоб',
    mobileKick: 'простір, щоб',
    label: 'Забронювати студію',
    href: ecosystemDestinations.studioBooking,
    logo: studioAssets.home.imgLogoStudio,
    mobileLogo: studioAssets.homeMobile.imgLogoStudio,
    caption: 'оренда залів',
    name: 'Studio',
  },
  academy: {
    image: studioAssets.home.imgImgHome144001,
    mobileImage: studioAssets.homeMobile.imgImgHome39001,
    kick: 'вчимо',
    mobileKick: 'вчимо, як',
    label: 'Обрати курс',
    href: studioAcademyDestinations.overview,
    logo: studioAssets.home.imgLogoAcademy,
    mobileLogo: studioAssets.homeMobile.imgLogoAcademy,
    caption: 'курси і воркшопи',
    name: 'Academy',
  },
  shop: {
    image: studioAssets.artifact.hero_tech,
    kick: 'техніка, щоб',
    mobileKick: 'техніка, щоб',
    label: 'Підібрати техніку',
    href: ecosystemDestinations.shop,
    logo: studioAssets.home.imgLogoShop,
    mobileLogo: studioAssets.homeMobile.imgLogoShop,
    caption: 'техніка для зйомки',
    name: 'Shop',
  },
};

export const homeVisuals = [
  {
    id: 'academy-0',
    image: homeModes.academy.image,
    mobileImage: homeModes.academy.mobileImage,
  },
  {
    id: 'academy-1',
    image: studioAssets.artifact.hero_studio,
    mobileImage: undefined,
  },
  {
    id: 'academy-2',
    image: studioAssets.artifact.hero_shop,
    mobileImage: undefined,
  },
  {
    id: 'studio',
    image: homeModes.studio.image,
    mobileImage: homeModes.studio.mobileImage,
  },
  { id: 'shop', image: homeModes.shop.image, mobileImage: undefined },
];

export const homeHero = siteSection('hero', 'Перший екран і вкладки', [
  siteField('title', 'Заголовок', 'Бачити більше'),
  siteField('rooms-action', 'Зали · Текст кнопки', 'Подивитись зали'),
  ...Object.entries(homeModes).flatMap(([id, mode]) => [
    siteField(id + '-kick', mode.name + ' · акцент у заголовку', mode.kick),
    siteField(id + '-mobile-kick', mode.name + ' · акцент на телефоні', mode.mobileKick),
    siteField(id + '-cta', mode.name + ' · кнопка', mode.label),
    siteField(id + '-caption', mode.name + ' · підпис вкладки', mode.caption),
  ]),
  ...homeVisuals.flatMap((visual) => [
    siteField(visual.id + '-image', 'Фото · ' + visual.id, visual.image.src, 'image'),
    ...(visual.mobileImage
      ? [
          siteField(
            visual.id + '-mobile-image',
            'Фото на телефоні · ' + visual.id,
            visual.mobileImage.src,
            'image',
          ),
        ]
      : []),
  ]),
]);
