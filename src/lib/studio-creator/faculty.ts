import { studioAssets } from '@/lib/studio-design/assets';
import type { CreatorLecturer } from './types';

/** Course-specific faculty from the approved Figma frame 949:443. */
export const creatorFaculty: readonly CreatorLecturer[] = [
  {
    id: 'olena-popova',
    name: 'Олена Попова',
    roles: ['Авторка курсу', 'рекламна фотографка'],
    bio: 'Понад 15 років у рекламній зйомці. Кампанії для McDonald’s, Bang&Olufsen, Pepsi, Lay’s, Сільпо, Novus, DonerMarket і «Вуличної їжі». Викладає та проводить майстер-класи для iSpace, DragonCapital, BihusInfo, Києво-Могилянської академії.',
    portrait: studioAssets.academy.imgImgOlena,
  },
  {
    id: 'oleksandra-kuliniak',
    name: 'Олександра Куліняк',
    roles: ['Мобільна фотографка', 'візуальний контент'],
    bio: 'Створює візуальний контент для ресторанів, спортивних клубів, магазинів і державних установ.',
    portrait: studioAssets.academy.imgImgOleksandra,
  },
  {
    id: 'eduard-kryzhanovskyi',
    name: 'Едуард Крижановський',
    roles: ['Фотограф', 'лектор курсу'],
  },
  {
    id: 'kateryna-maksymenko',
    name: 'Катерина Максименко',
    roles: ['Фотографка', 'лекторка курсу'],
  },
  {
    id: 'renat-zihanshyn',
    name: 'Ренат Зіганшин',
    roles: ['Маркетолог', 'таргетолог'],
    bio: 'Запускав проєкти для «Київстар», «Веселої корівки» та інших великих українських і міжнародних брендів. Викладає маркетинг і таргетовану рекламу, зокрема в Києво-Могилянській академії.',
    portrait: {
      src: '/images/studio/creator/faculty/renat-zihanshyn-fabbbe6146b1.webp',
      width: 800,
      height: 1200,
      position: 'center 4%',
    },
  },
  {
    id: 'yuliia-davydenko',
    name: 'Юлія Давиденко',
    roles: ['Маркетологиня', 'таргетологиня'],
    bio: 'Викладає маркетинг в університетах, досліджує роботу з цільовою аудиторією.',
  },
  {
    id: 'anna-liutko',
    name: 'Анна Лютько',
    roles: ['YouTube', 'SMM'],
    bio: 'Експертка з YouTube і маркетингу в соцмережах: 12 золотих і 50 срібних кнопок YouTube.',
    portrait: {
      src: '/images/studio/creator/faculty/anna-liutko-d679b8e7e6bd.webp',
      width: 719,
      height: 1200,
      position: 'center 3%',
    },
  },
  {
    id: 'anna-shtamburh',
    name: 'Анна Штамбург',
    roles: ['Контент', 'SMM'],
    bio: 'Понад 14 років створює контент для великих брендів. Викладає SMM в університетах і школах.',
  },
  {
    id: 'maksym-honcharuk',
    name: 'Максим Гончарук',
    roles: ['AI-контент'],
    bio: 'Створює ролики за допомогою штучного інтелекту для українських і міжнародних компаній.',
  },
  {
    id: 'andrii-provotar',
    name: 'Андрій Провотар',
    roles: ['Креативний продюсер', 'режисер реклами'],
    bio: 'Розробляв і знімав відеоконтент для Pepsi, АТБ, Novus, Lay’s та інших брендів.',
    portrait: {
      src: '/images/studio/creator/faculty/andrii-provotar-73b2cb13a70e.webp',
      width: 800,
      height: 1200,
      position: 'center 19%',
    },
  },
  {
    id: 'nataliia-avdieieva',
    name: 'Наталія Авдєєва',
    roles: ['Комунікації'],
    bio: 'Директорка з комунікацій Фонду Притули. Була CEO Stand Up Art House Kyiv і Laklabel, SMM-менеджеркою 1900 і Coffeereligia, працювала з OBERIG і BULGARI, у 2019 році — в комунікаційній команді МОЗ.',
    portrait: {
      src: '/images/studio/creator/faculty/nataliia-avdieieva-c4c93849c95e.webp',
      width: 621,
      height: 572,
    },
  },
];
