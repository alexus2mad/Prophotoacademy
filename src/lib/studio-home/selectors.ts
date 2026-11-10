import { studioReviews } from '@/lib/studio-reviews/reviews';
import { studioAssets } from '@/lib/studio-design/assets';
import type { AcademyContent } from '@/lib/content/types';
import type { StudioHomeDirection, StudioHomeReview, StudioHomeWork } from './types';

export function studioHomeDirections(content: AcademyContent): StudioHomeDirection[] {
  const individual = content.programs.find((program) => program.category === 'individual');
  const corporate = content.programs.find((program) => program.category === 'corporate');
  return [
    {
      title: 'Курси',
      description: 'Навчання онлайн з практикою в Києві',
      action: 'Усі курси',
      image: studioAssets.home.imgImgHome144003,
      mobileImage: studioAssets.homeMobile.imgImgHome39002,
      href: '/courses?category=course',
    },
    {
      title: 'Воркшопи',
      description: 'Практичне навчання в студії та на виїзді',
      action: 'Усі воркшопи',
      image: studioAssets.home.imgImgHome144004,
      mobileImage: studioAssets.homeMobile.imgImgHome39003,
      href: '/academy#workshops',
    },
    {
      title: 'Офлайн програми',
      description: 'Заняття наживо в Києві',
      action: 'Дізнатись розклад',
      image: studioAssets.home.imgImgHome144005,
      mobileImage: studioAssets.homeMobile.imgImgHome39004,
      inquiry: {
        title: 'Дізнатись розклад офлайн програм',
        subject: 'program-selection',
        source: 'homepage-card',
      },
    },
    {
      title: 'Індивідуальне навчання',
      description: 'Під ваш рівень і цілі',
      action: 'Детальніше',
      image: studioAssets.home.imgImgHome144006,
      mobileImage: studioAssets.homeMobile.imgImgHome39005,
      href: individual ? `/${individual.slug}` : '/academy#individual',
    },
    {
      title: 'Корпоративне навчання',
      description: 'Для команд і бізнесу',
      action: 'Детальніше',
      image: studioAssets.home.imgImgHome144007,
      href: corporate ? `/${corporate.slug}` : '/academy#corporate',
    },
    {
      title: 'ProPhoto Кемп',
      description: 'Виїзна програма',
      action: 'Дізнатись дати',
      image: studioAssets.home.imgImgHome144008,
      inquiry: { title: 'Дізнатись дати ProPhoto Кемпу', subject: 'camp', source: 'homepage-card' },
    },
  ];
}

export const studioHomeRooms: StudioHomeDirection[] = [
  {
    title: 'Циклорама',
    action: 'Детальніше',
    image: studioAssets.studio.imgImgCyclo2,
    mobileImage: studioAssets.homeStudioMobile.imgImgHome390Studio02,
    href: '/photo-studio#cyclorama',
  },
  {
    title: 'Контент зал',
    action: 'Детальніше',
    image: studioAssets.studio.imgImgContent1,
    href: '/photo-studio#content-room',
  },
  {
    title: 'Гримерна',
    action: 'Детальніше',
    image: studioAssets.studio.imgImgMakeup1,
    href: '/photo-studio#makeup',
  },
];

export const studioHomeWorks: StudioHomeWork[] = [
  {
    id: 'work-1',
    image: studioAssets.home.imgImgHome144011,
    mobileImage: studioAssets.homeMobile.imgImgHome39010,
    alt: 'Робота студентки: модель у в’язаній сукні серед природи',
  },
  {
    id: 'work-2',
    image: studioAssets.home.imgImgHome144012,
    mobileImage: studioAssets.homeMobile.imgImgHome39011,
    alt: 'Робота студентки: зйомка на міській вулиці',
  },
  {
    id: 'work-3',
    image: studioAssets.home.imgImgHome144013,
    mobileImage: studioAssets.homeMobile.imgImgHome39012,
    alt: 'Робота студентки: модель у блакитній сукні на вітрі',
  },
  {
    id: 'work-4',
    image: studioAssets.home.imgImgHome144014,
    mobileImage: studioAssets.homeMobile.imgImgHome39013,
    alt: 'Робота студентки: срібляста тканина у русі під деревами',
  },
  {
    id: 'work-5',
    image: studioAssets.artifact.gw1,
    alt: 'Робота студентки: предметна композиція з помадами',
  },
  {
    id: 'work-6',
    image: studioAssets.artifact.gw2,
    alt: 'Робота студентки: яскраві фарби й пензлі',
  },
  {
    id: 'work-7',
    image: studioAssets.artifact.gw3,
    alt: 'Робота студентки: чорно-білий жіночий портрет',
  },
  {
    id: 'work-8',
    image: studioAssets.artifact.gw4,
    alt: 'Робота студентки: далматинець на зеленій галявині',
  },
  {
    id: 'work-9',
    image: studioAssets.artifact.gw5,
    alt: 'Робота студентки: оливки та оливкова олія',
  },
  { id: 'work-10', image: studioAssets.artifact.gw6, alt: 'Робота студентки: портрет пари' },
  {
    id: 'work-11',
    image: studioAssets.artifact.gw7,
    alt: 'Робота студентки: келих із бризками на помаранчевому тлі',
  },
  {
    id: 'work-12',
    image: studioAssets.artifact.dir_gold,
    alt: 'Робота студентки: портрет із золотою тканиною',
  },
  {
    id: 'work-13',
    image: studioAssets.artifact.dir_curly,
    alt: 'Робота студентки: портрет кучерявої моделі',
  },
  {
    id: 'work-14',
    image: studioAssets.artifact.dir_suit,
    alt: 'Робота студентки: білий костюм на чорному тлі',
  },
  {
    id: 'work-15',
    image: studioAssets.artifact.hero_academy,
    alt: 'Робота студентки: модель під водою',
  },
  { id: 'work-16', image: studioAssets.artifact.hero_shop, alt: 'Робота студентки: б’юті-портрет' },
];

export const studioHomeReviews: StudioHomeReview[] = studioReviews.slice(0, 8);
