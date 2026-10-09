import { load } from 'cheerio';
import { readFile } from 'node:fs/promises';
for (const slug of ['terms-of-service', 'privacy-policy', 'reviews', 'food-product-photography']) {
  const $ = load(await readFile(`content/source/pages/${slug}.html`, 'utf8'));
  console.log(`\n${slug}`);
  console.log(
    $('h1,h2,h3')
      .map((i, e) => ({
        tag: e.tagName,
        text: $(e).text().slice(0, 120),
        parent: $(e).parent().attr('class'),
      }))
      .get()
      .slice(0, 30),
  );
  if (slug === 'reviews')
    console.log(
      $('img')
        .map((i, e) => ({
          alt: $(e).attr('alt'),
          src: $(e).attr('src'),
          parent: $(e).parent().attr('class'),
        }))
        .get()
        .slice(0, 30),
    );
  if (slug.includes('policy') || slug.includes('terms'))
    console.log(
      $('p')
        .map((i, e) => ({ text: $(e).text().slice(0, 180), parent: $(e).parent().attr('class') }))
        .get()
        .slice(0, 8),
    );
}
