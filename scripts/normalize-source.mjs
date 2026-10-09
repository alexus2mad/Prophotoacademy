import { readFile, writeFile } from 'node:fs/promises';
import { load } from 'cheerio';
import { createHash } from 'node:crypto';
const seed = JSON.parse(await readFile('content/academy.json', 'utf8'));
seed.pages = seed.pages.filter((p) => !['terms-of-service', 'privacy-policy'].includes(p.slug));
for (const slug of ['terms-of-service', 'privacy-policy']) {
  const $ = load(await readFile(`content/source/pages/${slug}.html`, 'utf8'));
  const rich = $(
    slug === 'terms-of-service'
      ? '.terms-of-service-content-wrapper'
      : '.privacy-policy-content-text-wrapper',
  ).first();
  if (!rich.length) throw new Error(`Missing legal body: ${slug}`);
  const body = [];
  rich
    .find('h4,.terms-of-service-text-description,.privacy-policy-subheading-text-description')
    .each((i, e) => {
      if ($(e).parents('li').length) return;
      const text = $(e).text().replace(/\s+/g, ' ').trim();
      if (!text) return;
      const key = createHash('sha1').update(`${slug}:${i}:${text}`).digest('hex').slice(0, 16);
      const markDefs = [];
      const children = [];
      const counter = $(e).prev('[class*="counter-rules"]').text().replace(/\s+/g, ' ').trim();
      if (counter)
        children.push({ _type: 'span', _key: 'counter', text: counter + ' ', marks: [] });
      const walk = (node) => {
        if (node.type === 'text') {
          if (node.data)
            children.push({
              _type: 'span',
              _key: `s${children.length}`,
              text: node.data,
              marks: [],
            });
          return;
        }
        if (node.name === 'br') {
          children.push({ _type: 'span', _key: `s${children.length}`, text: '\n', marks: [] });
          return;
        }
        const start = children.length;
        node.children?.forEach(walk);
        if (node.name === 'a' && /^(https?:|mailto:|tel:)/.test($(node).attr('href') || '')) {
          const mark = `link${markDefs.length}`;
          markDefs.push({ _type: 'link', _key: mark, href: $(node).attr('href') });
          children.slice(start).forEach((span) => span.marks.push(mark));
        }
        if (['strong', 'b', 'em', 'i'].includes(node.name) || $(node).hasClass('text-bold'))
          children
            .slice(start)
            .forEach((span) => span.marks.push(['em', 'i'].includes(node.name) ? 'em' : 'strong'));
      };
      e.children?.forEach(walk);
      body.push({
        _type: 'block',
        _key: key,
        style: e.name === 'h4' ? 'h3' : 'normal',
        children,
        markDefs,
      });
    });
  seed.pages.push({
    id: `page-${slug}`,
    slug,
    title: $('h2').first().text().trim(),
    body,
    sourceUrl: `https://www.prophotoacademy.com.ua/${slug}`,
  });
  console.log(`Normalized ${slug}: ${body.length} blocks`);
}
const $ = load(await readFile('content/source/pages/reviews.html', 'utf8'));
seed.testimonials = [];
const seen = new Set();
$('.testimonial-card-top').each((i, element) => {
  const card = $(element).parent();
  const review = card.find('.testimonial-card-text').first().clone();
  review.find('br').replaceWith(' ');
  review.find('p').each((_, p) => $(p).append(' '));
  const quote = review.text().replace(/\s+/g, ' ').trim();
  const name = card.find('.testimonial-card-author-name').first().text().trim();
  if (!quote || !name || seen.has(quote)) return;
  seen.add(quote);
  const storyNames = [
    'Anastasia Kulikova',
    'Yana Titova',
    'Олена',
    'Ольга Архилюк',
    'Наталія Рябкова',
    'Дарʼя Новіцька',
    'Катерина Драмарецька',
  ];
  seed.testimonials.push({
    id: 'testimonial-' + createHash('sha1').update(quote).digest('hex').slice(0, 12),
    name,
    kind: storyNames.includes(name) ? 'story' : 'quote',
    quote,
    sourceUrl: 'https://www.prophotoacademy.com.ua/reviews',
  });
});
console.log(`Normalized ${seed.testimonials.length} attributed text testimonials`);
const metadata = JSON.parse(await readFile('content/media-metadata.json', 'utf8'));
seed.images = seed.images.map((image) => ({ ...image, ...metadata[image.id] }));
function cleanTitles(value) {
  if (Array.isArray(value)) value.forEach(cleanTitles);
  else if (value && typeof value === 'object') {
    for (const key of ['title', 'shortTitle', 'heroTitle'])
      if (typeof value[key] === 'string') value[key] = value[key].replace(/\.+\s*$/, '');
    if (value._type === 'block' && ['h2', 'h3'].includes(value.style)) {
      const last = value.children.at(-1);
      if (last) last.text = last.text.replace(/\.+\s*$/, '');
    }
    Object.values(value).forEach(cleanTitles);
  }
}
cleanTitles(seed);
await writeFile('content/academy.json', JSON.stringify(seed, null, 2));
