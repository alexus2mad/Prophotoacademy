import type { PlacementDefinition, SitePage } from './types';

const names = {
  hero: 'Перший екран',
  exposure: 'Експозиція',
  directions: 'Напрями навчання',
  founder: 'Засновниця',
  proof: 'Партнери та досягнення',
  reviews: 'Відгуки',
  gallery: 'Галерея робіт',
  'shop-banner': 'ProPhoto Shop',
  'studio-banner': 'ProPhoto Studio',
  inquiry: 'Заявка на консультацію',
  courses: 'Головні курси',
  workshops: 'Воркшопи',
  formats: 'Інші формати навчання',
  audience: 'Для кого',
  trust: 'Чому нам довіряють',
  faculty: 'Лектори',
  announcement: 'Про інтенсив',
  curriculum: 'Програма навчання',
  spaces: 'Зали студії',
  booking: 'Бронювання студії',
  selection: 'Підбір обладнання',
  intro: 'Вступ',
  figures: 'Академія в цифрах',
  team: 'Команда',
  contacts: 'Контакти та консультація',
  benefits: 'Переваги курсу',
  steps: 'Як проходить навчання',
  packages: 'Пакети участі',
  outcomes: 'Результати навчання',
  practice: 'Практика',
  faq: 'Запитання та відповіді',
  end: 'Кінець сторінки',
};
function named(...ids: (keyof typeof names)[]): PlacementDefinition[] {
  return ids.map((id) => ({ id, label: names[id] }));
}
const routes = new Map<string, PlacementDefinition[]>([
  [
    '/',
    named(
      'hero',
      'exposure',
      'directions',
      'founder',
      'proof',
      'reviews',
      'gallery',
      'shop-banner',
      'studio-banner',
      'inquiry',
    ),
  ],
  [
    '/academy',
    named(
      'hero',
      'courses',
      'workshops',
      'formats',
      'audience',
      'trust',
      'faculty',
      'reviews',
      'inquiry',
    ),
  ],
  ['/ai-artwork', named('hero', 'announcement', 'curriculum', 'faculty', 'gallery', 'inquiry')],
  ['/photo-studio', named('hero', 'spaces', 'booking')],
  ['/shop', named('hero', 'selection')],
  ['/about-us', named('intro', 'figures', 'team', 'inquiry')],
  ['/student-work', named('intro', 'gallery', 'inquiry')],
  ['/reviews', named('intro', 'reviews', 'inquiry')],
  ['/contacts', named('intro', 'contacts')],
]);
const creator = named(
  'hero',
  'intro',
  'audience',
  'benefits',
  'curriculum',
  'steps',
  'gallery',
  'faculty',
  'reviews',
  'packages',
  'inquiry',
  'studio-banner',
);
const program = named(
  'hero',
  'outcomes',
  'audience',
  'packages',
  'curriculum',
  'practice',
  'faculty',
  'gallery',
  'reviews',
  'faq',
  'inquiry',
);
const last = named('end')[0];

export function pagePlacements(page: SitePage): PlacementDefinition[] {
  const fixed = routes.get(page.path);
  if (fixed) return [...fixed, last];
  const native = page.sections.filter((section) => !section.blockType);
  if (native.some((section) => section.id === 'landing-cover'))
    return [...native.map(({ id, label }) => ({ id, label })), last];
  if (page.path === '/terms-of-service' || page.path === '/privacy-policy') {
    return [
      ...named('intro'),
      ...native
        .filter((section) => section.label.startsWith('Розділ · '))
        .map((section) => ({
          id: section.id,
          label: section.fields.map((f) => f.value).join('') || section.label,
        })),
      last,
    ];
  }
  if (native.some((section) => section.id === 'overview'))
    return [...(native.some((section) => section.id === 'benefits') ? creator : program), last];
  return [last];
}

export function blocksAtPlacement(page: SitePage, id: string) {
  const available = new Set(pagePlacements(page).map((slot) => slot.id));
  return page.sections.filter(
    (section) =>
      section.blockType &&
      (section.placement && available.has(section.placement) ? section.placement : 'end') === id,
  );
}
