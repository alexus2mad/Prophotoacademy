import { mkdir, writeFile } from 'node:fs/promises';
const slugs = [
  '',
  'visual-content',
  'food-product-photography',
  'course-smm-instagram',
  'pro-photo-lab',
  'reviews',
  'about-us',
  'contacts',
  'terms-of-service',
  'privacy-policy',
  'thanks',
  'page-in-progress',
];
await mkdir('content/source/pages', { recursive: true });
for (let i = 0; i < slugs.length; i += 3)
  await Promise.all(
    slugs.slice(i, i + 3).map(async (slug) => {
      const url = `https://www.prophotoacademy.com.ua/${slug}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      const html = await response.text();
      await writeFile(`content/source/pages/${slug || 'home'}.html`, html);
      console.log(`Captured ${slug || 'home'}`);
    }),
  );
